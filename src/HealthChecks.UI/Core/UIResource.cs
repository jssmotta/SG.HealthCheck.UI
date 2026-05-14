namespace HealthChecks.UI.Core;

internal class UIResource
{
    public string Content { get; internal set; }
    public string ContentType { get; }
    public string FileName { get; }

    private UIResource(string fileName, string content, string contentType)
    {
        ArgumentNullException.ThrowIfNull(content);
        ArgumentNullException.ThrowIfNull(contentType);
        ArgumentNullException.ThrowIfNull(fileName);
        Content = content;
        ContentType = contentType;
        FileName = fileName;
    }

    public static UIResource Create(string fileName, string content, string contentType)
    {
        return new UIResource(fileName, content, contentType);
    }
}
