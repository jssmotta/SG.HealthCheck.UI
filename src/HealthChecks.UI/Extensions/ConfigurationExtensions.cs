using HealthChecks.UI.Configuration;

namespace Microsoft.Extensions.Configuration;

public static class ConfigurationExtensions
{
    public static IConfigurationSection GetSectionWithFallBack
        (this IConfiguration configuration, string section, string fallback)
    {
        IConfigurationSection configurationSection = configuration.GetSection(section);

        if (!configurationSection.Exists())
        {
            configurationSection = configuration.GetSection(fallback);
        }

        return configurationSection;
    }
}
