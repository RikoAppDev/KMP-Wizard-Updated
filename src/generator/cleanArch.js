// Generates clean architecture sample code with feature-based package structure
// Supports MVI pattern in presentation layer
import { getSelectedLibs } from './libraryDefs.js'

/**
 * Generate clean architecture sample code for Gradle-based projects
 * Structure: shared/src/commonMain/kotlin/{packagePath}/...
 */
export function generateCleanArchGradle(zip, config, packagePath) {
    const { projectId, dependencies } = config
    const selectedLibs = getSelectedLibs(dependencies || {})
    const selectedIds = new Set(selectedLibs.map(l => l.id))

    const basePath = `shared/src/commonMain/kotlin/${packagePath}`
    const composeBasePath = `composeApp/src/commonMain/kotlin/${packagePath}`

    generateCoreFiles(zip, projectId, basePath, selectedIds)
    generateFeatureFiles(zip, projectId, basePath, composeBasePath, selectedIds)
}

/**
 * Generate clean architecture sample code for Amper-based projects
 * Structure: composeApp/src/...
 */
export function generateCleanArchAmper(zip, config) {
    const { projectId, dependencies } = config
    const selectedLibs = getSelectedLibs(dependencies || {})
    const selectedIds = new Set(selectedLibs.map(l => l.id))

    const basePath = `composeApp/src`
    const composeBasePath = `composeApp/src`

    generateCoreFiles(zip, projectId, basePath, selectedIds)
    generateFeatureFiles(zip, projectId, basePath, composeBasePath, selectedIds)
}

function generateCoreFiles(zip, projectId, basePath, selectedIds) {
    // --- core/util/Result.kt ---
    zip.file(
        `${basePath}/core/util/Result.kt`,
        `package ${projectId}.core.util

sealed class Result<out T> {
    data class Success<T>(val data: T) : Result<T>()
    data class Error(val message: String, val throwable: Throwable? = null) : Result<Nothing>()
    data object Loading : Result<Nothing>()
}
`
    )

    // --- core/util/UiText.kt ---
    zip.file(
        `${basePath}/core/util/UiText.kt`,
        `package ${projectId}.core.util

sealed class UiText {
    data class DynamicString(val value: String) : UiText()
    data class StringResource(val id: String) : UiText()
}
`
    )

    // --- core/presentation/MviViewModel.kt ---
    zip.file(
        `${basePath}/core/presentation/MviViewModel.kt`,
        `package ${projectId}.core.presentation

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/**
 * Base ViewModel implementing the MVI (Model-View-Intent) pattern.
 *
 * @param S The type of the UI state
 * @param I The type of the user intent
 * @param E The type of the side effect / one-time event
 */
abstract class MviViewModel<S, I, E>(initialState: S) {

    protected val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main)

    private val _state = MutableStateFlow(initialState)
    val state: StateFlow<S> = _state.asStateFlow()

    private val _effect = MutableSharedFlow<E>()
    val effect: SharedFlow<E> = _effect.asSharedFlow()

    protected val currentState: S get() = _state.value

    fun onIntent(intent: I) {
        handleIntent(intent)
    }

    protected abstract fun handleIntent(intent: I)

    protected fun updateState(reducer: S.() -> S) {
        _state.value = currentState.reducer()
    }

    protected fun emitEffect(effect: E) {
        scope.launch {
            _effect.emit(effect)
        }
    }
}
`
    )

    // --- core/domain/UseCase.kt ---
    zip.file(
        `${basePath}/core/domain/UseCase.kt`,
        `package ${projectId}.core.domain

import ${projectId}.core.util.Result

/**
 * Base use case for operations that return a flow of results.
 */
interface UseCase<in P, out R> {
    suspend operator fun invoke(params: P): Result<R>
}

/**
 * Use case that takes no parameters.
 */
interface NoParamUseCase<out R> {
    suspend operator fun invoke(): Result<R>
}
`
    )

    // --- DI module if Koin is selected ---
    if (selectedIds.has('koin')) {
        zip.file(
            `${basePath}/di/AppModule.kt`,
            `package ${projectId}.di

import ${projectId}.feature.example.data.repository.ExampleRepositoryImpl
import ${projectId}.feature.example.domain.repository.ExampleRepository
import ${projectId}.feature.example.domain.usecase.GetExamplesUseCase
import ${projectId}.feature.example.presentation.ExampleViewModel
import org.koin.core.module.dsl.factoryOf
import org.koin.core.module.dsl.singleOf
import org.koin.dsl.bind
import org.koin.dsl.module

val appModule = module {
    // Data
    singleOf(::ExampleRepositoryImpl) bind ExampleRepository::class

    // Domain
    factoryOf(::GetExamplesUseCase)

    // Presentation
    factoryOf(::ExampleViewModel)
}
`
        )
    }
}

function generateFeatureFiles(zip, projectId, basePath, composeBasePath, selectedIds) {
    // ==========================================
    // Feature: Example
    // ==========================================

    // --- domain/model/Example.kt ---
    zip.file(
        `${basePath}/feature/example/domain/model/Example.kt`,
        `package ${projectId}.feature.example.domain.model

data class Example(
    val id: String,
    val title: String,
    val description: String,
)
`
    )

    // --- domain/repository/ExampleRepository.kt ---
    zip.file(
        `${basePath}/feature/example/domain/repository/ExampleRepository.kt`,
        `package ${projectId}.feature.example.domain.repository

import ${projectId}.feature.example.domain.model.Example
import ${projectId}.core.util.Result

interface ExampleRepository {
    suspend fun getExamples(): Result<List<Example>>
    suspend fun getExampleById(id: String): Result<Example>
}
`
    )

    // --- domain/usecase/GetExamplesUseCase.kt ---
    zip.file(
        `${basePath}/feature/example/domain/usecase/GetExamplesUseCase.kt`,
        `package ${projectId}.feature.example.domain.usecase

import ${projectId}.core.util.Result
import ${projectId}.feature.example.domain.model.Example
import ${projectId}.feature.example.domain.repository.ExampleRepository

class GetExamplesUseCase(
    private val repository: ExampleRepository,
) {
    suspend operator fun invoke(): Result<List<Example>> {
        return repository.getExamples()
    }
}
`
    )

    // --- data/model/ExampleDto.kt ---
    const serializationImport = selectedIds.has('kotlinx-serialization')
        ? `import kotlinx.serialization.Serializable\n\n@Serializable`
        : ''

    zip.file(
        `${basePath}/feature/example/data/model/ExampleDto.kt`,
        `package ${projectId}.feature.example.data.model

${serializationImport}
data class ExampleDto(
    val id: String,
    val title: String,
    val description: String,
)
`
    )

    // --- data/mapper/ExampleMapper.kt ---
    zip.file(
        `${basePath}/feature/example/data/mapper/ExampleMapper.kt`,
        `package ${projectId}.feature.example.data.mapper

import ${projectId}.feature.example.data.model.ExampleDto
import ${projectId}.feature.example.domain.model.Example

fun ExampleDto.toDomain(): Example {
    return Example(
        id = id,
        title = title,
        description = description,
    )
}

fun List<ExampleDto>.toDomain(): List<Example> = map { it.toDomain() }
`
    )

    // --- data/remote/ExampleApi.kt (if Ktor selected) ---
    if (selectedIds.has('ktor-client')) {
        zip.file(
            `${basePath}/feature/example/data/remote/ExampleApi.kt`,
            `package ${projectId}.feature.example.data.remote

import ${projectId}.feature.example.data.model.ExampleDto
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.get

class ExampleApi(
    private val client: HttpClient,
) {
    suspend fun getExamples(): List<ExampleDto> {
        return client.get("/examples").body()
    }

    suspend fun getExampleById(id: String): ExampleDto {
        return client.get("/examples/\${id}").body()
    }
}
`
        )
    }

    // --- data/repository/ExampleRepositoryImpl.kt ---
    const hasKtor = selectedIds.has('ktor-client')

    zip.file(
        `${basePath}/feature/example/data/repository/ExampleRepositoryImpl.kt`,
        `package ${projectId}.feature.example.data.repository

import ${projectId}.core.util.Result
import ${projectId}.feature.example.data.mapper.toDomain
import ${projectId}.feature.example.data.model.ExampleDto
import ${projectId}.feature.example.domain.model.Example
import ${projectId}.feature.example.domain.repository.ExampleRepository
${hasKtor ? `import ${projectId}.feature.example.data.remote.ExampleApi\n` : ''}
class ExampleRepositoryImpl(${hasKtor ? '\n    private val api: ExampleApi,' : ''}
) : ExampleRepository {

    override suspend fun getExamples(): Result<List<Example>> {
        return try {${hasKtor ? `
            val dtos = api.getExamples()
            Result.Success(dtos.toDomain())` : `
            // TODO: Replace with real data source
            val dtos = listOf(
                ExampleDto("1", "First Example", "This is the first example item"),
                ExampleDto("2", "Second Example", "This is the second example item"),
                ExampleDto("3", "Third Example", "This is the third example item"),
            )
            Result.Success(dtos.toDomain())`}
        } catch (e: Exception) {
            Result.Error(e.message ?: "Unknown error", e)
        }
    }

    override suspend fun getExampleById(id: String): Result<Example> {
        return try {${hasKtor ? `
            val dto = api.getExampleById(id)
            Result.Success(dto.toDomain())` : `
            // TODO: Replace with real data source
            val dto = ExampleDto(id, "Example \$id", "Description for example \$id")
            Result.Success(dto.toDomain())`}
        } catch (e: Exception) {
            Result.Error(e.message ?: "Unknown error", e)
        }
    }
}
`
    )

    // --- presentation/ExampleState.kt ---
    zip.file(
        `${basePath}/feature/example/presentation/ExampleState.kt`,
        `package ${projectId}.feature.example.presentation

import ${projectId}.feature.example.domain.model.Example

data class ExampleState(
    val isLoading: Boolean = false,
    val examples: List<Example> = emptyList(),
    val error: String? = null,
    val selectedExample: Example? = null,
)
`
    )

    // --- presentation/ExampleIntent.kt ---
    zip.file(
        `${basePath}/feature/example/presentation/ExampleIntent.kt`,
        `package ${projectId}.feature.example.presentation

sealed interface ExampleIntent {
    data object LoadExamples : ExampleIntent
    data class SelectExample(val id: String) : ExampleIntent
    data object DismissError : ExampleIntent
}
`
    )

    // --- presentation/ExampleEffect.kt ---
    zip.file(
        `${basePath}/feature/example/presentation/ExampleEffect.kt`,
        `package ${projectId}.feature.example.presentation

sealed interface ExampleEffect {
    data class ShowError(val message: String) : ExampleEffect
    data class NavigateToDetail(val id: String) : ExampleEffect
}
`
    )

    // --- presentation/ExampleViewModel.kt ---
    zip.file(
        `${basePath}/feature/example/presentation/ExampleViewModel.kt`,
        `package ${projectId}.feature.example.presentation

import ${projectId}.core.presentation.MviViewModel
import ${projectId}.core.util.Result
import ${projectId}.feature.example.domain.usecase.GetExamplesUseCase
import kotlinx.coroutines.launch

class ExampleViewModel(
    private val getExamplesUseCase: GetExamplesUseCase,
) : MviViewModel<ExampleState, ExampleIntent, ExampleEffect>(ExampleState()) {

    init {
        onIntent(ExampleIntent.LoadExamples)
    }

    override fun handleIntent(intent: ExampleIntent) {
        when (intent) {
            is ExampleIntent.LoadExamples -> loadExamples()
            is ExampleIntent.SelectExample -> selectExample(intent.id)
            is ExampleIntent.DismissError -> dismissError()
        }
    }

    private fun loadExamples() {
        scope.launch {
            updateState { copy(isLoading = true, error = null) }
            when (val result = getExamplesUseCase()) {
                is Result.Success -> {
                    updateState { copy(isLoading = false, examples = result.data) }
                }
                is Result.Error -> {
                    updateState { copy(isLoading = false, error = result.message) }
                    emitEffect(ExampleEffect.ShowError(result.message))
                }
                is Result.Loading -> {
                    updateState { copy(isLoading = true) }
                }
            }
        }
    }

    private fun selectExample(id: String) {
        val example = currentState.examples.find { it.id == id }
        updateState { copy(selectedExample = example) }
        emitEffect(ExampleEffect.NavigateToDetail(id))
    }

    private fun dismissError() {
        updateState { copy(error = null) }
    }
}
`
    )

    // --- presentation/ExampleScreen.kt (in composeApp) ---
    zip.file(
        `${composeBasePath}/feature/example/ExampleScreen.kt`,
        `package ${projectId}.feature.example

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import ${projectId}.feature.example.presentation.ExampleIntent
import ${projectId}.feature.example.presentation.ExampleState

@Composable
fun ExampleScreen(
    state: ExampleState,
    onIntent: (ExampleIntent) -> Unit,
    modifier: Modifier = Modifier,
) {
    Box(modifier = modifier.fillMaxSize()) {
        when {
            state.isLoading -> {
                CircularProgressIndicator(
                    modifier = Modifier.align(Alignment.Center)
                )
            }
            state.error != null -> {
                Column(
                    modifier = Modifier.align(Alignment.Center).padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                ) {
                    Text(
                        text = state.error,
                        color = MaterialTheme.colorScheme.error,
                        style = MaterialTheme.typography.bodyLarge,
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Button(onClick = { onIntent(ExampleIntent.LoadExamples) }) {
                        Text("Retry")
                    }
                }
            }
            else -> {
                LazyColumn(
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    items(state.examples) { example ->
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { onIntent(ExampleIntent.SelectExample(example.id)) },
                        ) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Text(
                                    text = example.title,
                                    style = MaterialTheme.typography.titleMedium,
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = example.description,
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
`
    )
}
