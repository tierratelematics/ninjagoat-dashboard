interface IConfigurableWidget<T> {
    configure(): Promise<T>;
}

export default IConfigurableWidget