using System.Security.Cryptography;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using ReviewService.Gateway.Options;

namespace ReviewService.Gateway.Configurations;

public static class JwtAuthConfiguration
{
    public static IServiceCollection AddJwtAuth(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<JwtOptions>(
            configuration.GetSection(nameof(JwtOptions)));
        
        var jwtOptions = configuration
            .GetSection(nameof(JwtOptions))
            .Get<JwtOptions>();

        if (jwtOptions == null)
        {
            throw new ApplicationException("JWTOptions not found in configuration");
        }
        
        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                if (string.IsNullOrWhiteSpace(jwtOptions.PublicKeyPath) 
                    && string.IsNullOrWhiteSpace(jwtOptions.PublicKey))
                {
                    throw new ApplicationException("JWTOptions:PublicKeyPath not found in configuration");
                }

                using var rsa = RSA.Create();
                
                if (!string.IsNullOrEmpty(jwtOptions.PublicKeyPath))
                    rsa.ImportFromPem(File.ReadAllText(jwtOptions.PublicKeyPath));
                else
                    rsa.ImportFromPem(jwtOptions.PublicKey);

                options.MapInboundClaims = false;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = jwtOptions.Issuer,
                    ValidateAudience = true,
                    ValidAudience = jwtOptions.Audience,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new RsaSecurityKey(rsa.ExportParameters(false))
                };
            });
        
        services.AddSwaggerGen(c =>
        {
            c.EnableAnnotations();
            
            c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Name = "Authorization",
                Type = SecuritySchemeType.ApiKey,
                Scheme = "Bearer",
                BearerFormat = "JWT",
                In = ParameterLocation.Header,
                Description = "Enter 'Bearer' [space] and then your token"
            });

            c.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        }
                    },
                    Array.Empty<string>()
                }
            });
        });

        return services;
    }
}
