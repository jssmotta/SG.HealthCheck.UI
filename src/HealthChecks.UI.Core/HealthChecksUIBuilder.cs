namespace Microsoft.Extensions.DependencyInjection;

public class HealthChecksUIBuilder
{
    public HealthChecksUIBuilder(IServiceCollection services)
    {
        Services = services ?? throw new ArgumentNullException(nameof(services));
    }

    public IServiceCollection Services { get; }
}
