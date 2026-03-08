namespace ReviewService.PersistentStorage.Abstractions.Options;

public sealed record DbOptions
{
    public required string Host { get; init; }  
    public required int Port { get; init; }
    public required string Database { get; init; }  
    public required string Username { get; init; }  
    public required string Password { get; init; }
    public int CommandTimeout { get; init; } = 5;
    
    public string ConnectionString 
        => $"Host={Host};Port={Port};Database={Database};Username={Username};Password={Password}";
}