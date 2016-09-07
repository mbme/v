// webpack declared variables

declare const __DEV__: boolean

interface WebpackHotAPI {
  accept: (path: string, cb: () => void) => void,
}

interface WebpackModuleAPI {
  hot: WebpackHotAPI,
}

interface RequiredModule<T> {
default: T,
}

interface RequireFunction {
    <T>(path: string): RequiredModule<T>
}

declare const require: RequireFunction

declare const module: WebpackModuleAPI
