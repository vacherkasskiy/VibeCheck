using GamificatonService.PersistentStorage.Entities;
using Microsoft.EntityFrameworkCore;

namespace GamificatonService.PersistentStorage;

public sealed class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<LevelThresholdEntity> LevelThresholds => Set<LevelThresholdEntity>();
    public DbSet<AchievementIconEntity> AchievementIcons => Set<AchievementIconEntity>();
    public DbSet<AchievementEntity> Achievements => Set<AchievementEntity>();
    public DbSet<UserAchievementEntity> UserAchievements => Set<UserAchievementEntity>();
    public DbSet<UserLevelEntity> UserLevels => Set<UserLevelEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        ConfigureXpRules(modelBuilder);
        ConfigureUserXpTransactions(modelBuilder);
        ConfigureLevelThresholds(modelBuilder);
        ConfigureAchievementIcons(modelBuilder);
        ConfigureAchievements(modelBuilder);
        ConfigureUserAchievements(modelBuilder);
        ConfigureUserLevels(modelBuilder);

        base.OnModelCreating(modelBuilder);
    }

    private static void ConfigureXpRules(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<XpRuleEntity>();

        entity.ToTable("xp_rules");

        entity.HasKey(x => x.Id);

        entity.Property(x => x.Id)
            .HasColumnName("id")
            .IsRequired();

        entity.Property(x => x.Code)
            .HasColumnName("code")
            .HasMaxLength(200)
            .IsRequired();

        entity.Property(x => x.Name)
            .HasColumnName("name")
            .HasMaxLength(200)
            .IsRequired();

        entity.Property(x => x.Description)
            .HasColumnName("description")
            .HasMaxLength(1000)
            .IsRequired();

        entity.Property(x => x.Type)
            .HasColumnName("type")
            .HasConversion<int>()
            .IsRequired();

        entity.Property(x => x.ActionKey)
            .HasColumnName("action_key")
            .HasMaxLength(200)
            .IsRequired();

        entity.Property(x => x.XpAmount)
            .HasColumnName("xp_amount")
            .IsRequired();

        entity.Property(x => x.ThresholdValue)
            .HasColumnName("threshold_value");

        entity.Property(x => x.IsActive)
            .HasColumnName("is_active")
            .IsRequired();

        entity.Property(x => x.IsRepeatable)
            .HasColumnName("is_repeatable")
            .IsRequired();

        entity.Property(x => x.CooldownDays)
            .HasColumnName("cooldown_days");

        entity.Property(x => x.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired()
            .HasDefaultValueSql("now()");

        entity.Property(x => x.UpdatedAt)
            .HasColumnName("updated_at")
            .IsRequired()
            .HasDefaultValueSql("now()");

        entity.HasIndex(x => x.Code)
            .IsUnique();

        entity.HasIndex(x => x.ActionKey);

        entity.HasIndex(x => new { x.ActionKey, x.Type, x.ThresholdValue });
    }
    
    private static void ConfigureUserXpTransactions(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<UserXpTransactionEntity>();

        entity.ToTable("user_xp_transactions");

        entity.HasKey(x => x.Id);

        entity.Property(x => x.Id)
            .HasColumnName("id")
            .IsRequired();

        entity.Property(x => x.UserId)
            .HasColumnName("user_id")
            .IsRequired();

        entity.Property(x => x.XpRuleId)
            .HasColumnName("xp_rule_id")
            .IsRequired();

        entity.Property(x => x.XpAmount)
            .HasColumnName("xp_amount")
            .IsRequired();

        entity.Property(x => x.EventId)
            .HasColumnName("event_id")
            .HasMaxLength(100);

        entity.Property(x => x.AggregateId)
            .HasColumnName("aggregate_id")
            .HasMaxLength(100);

        entity.Property(x => x.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired()
            .HasDefaultValueSql("now()");

        entity.HasOne(x => x.XpRule)
            .WithMany()
            .HasForeignKey(x => x.XpRuleId)
            .OnDelete(DeleteBehavior.Restrict);

        entity.HasIndex(x => x.UserId);

        entity.HasIndex(x => x.XpRuleId);

        entity.HasIndex(x => x.CreatedAt);

        entity.HasIndex(x => new { x.UserId, x.XpRuleId });

        entity.HasIndex(x => new { x.UserId, x.EventId });

        entity.HasIndex(x => new { x.UserId, x.XpRuleId, x.EventId });
    }
    
    private static void ConfigureLevelThresholds(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<LevelThresholdEntity>();

        entity.ToTable("level_thresholds");

        entity.HasKey(x => x.Level);

        entity.Property(x => x.Level)
            .HasColumnName("level")
            .IsRequired();

        entity.Property(x => x.XpRequiredTotal)
            .HasColumnName("xp_required_total")
            .IsRequired();

        entity.HasIndex(x => x.XpRequiredTotal);
    }

    private static void ConfigureAchievementIcons(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<AchievementIconEntity>();

        entity.ToTable("achievement_icons");

        entity.HasKey(x => x.Id);

        entity.Property(x => x.Id)
            .HasColumnName("id")
            .HasMaxLength(128)
            .IsRequired();

        entity.Property(x => x.Bucket)
            .HasColumnName("bucket")
            .HasMaxLength(128)
            .IsRequired();

        entity.Property(x => x.ObjectKey)
            .HasColumnName("object_key")
            .HasMaxLength(512)
            .IsRequired();

        entity.Property(x => x.ContentType)
            .HasColumnName("content_type")
            .HasMaxLength(128)
            .IsRequired();

        entity.Property(x => x.Etag)
            .HasColumnName("etag")
            .HasMaxLength(128)
            .IsRequired();

        entity.Property(x => x.SizeBytes)
            .HasColumnName("size_bytes")
            .IsRequired();

        entity.Property(x => x.CreatedAt)
            .HasColumnName("created_at")
            .HasColumnType("timestamp with time zone")
            .HasDefaultValueSql("now()")
            .IsRequired();

        entity.HasIndex(x => new { x.Bucket, x.ObjectKey })
            .IsUnique();

        entity.HasIndex(x => x.Etag);
    }

    private static void ConfigureAchievements(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<AchievementEntity>();

        entity.ToTable("achievements");

        entity.HasKey(x => x.Id);

        entity.Property(x => x.Id)
            .HasColumnName("id")
            .IsRequired();

        entity.Property(x => x.Name)
            .HasColumnName("name")
            .HasMaxLength(200)
            .IsRequired();

        entity.Property(x => x.Description)
            .HasColumnName("description")
            .HasColumnType("text")
            .IsRequired();
        
        entity.Property(x => x.XpReward)
            .HasColumnName("xp_reward")
            .IsRequired();

        entity.Property(x => x.IconId)
            .HasColumnName("icon_id")
            .HasMaxLength(128)
            .IsRequired();

        entity.Property(x => x.TargetValue)
            .HasColumnName("target_value")
            .IsRequired();

        entity.Property(x => x.IsActive)
            .HasColumnName("is_active")
            .IsRequired();

        entity.Property(x => x.CreatedAt)
            .HasColumnName("created_at")
            .HasColumnType("timestamp with time zone")
            .HasDefaultValueSql("now()")
            .IsRequired();

        entity.Property(x => x.UpdatedAt)
            .HasColumnName("updated_at")
            .HasColumnType("timestamp with time zone")
            .HasDefaultValueSql("now()")
            .IsRequired();

        entity.HasIndex(x => x.IconId);
        entity.HasIndex(x => x.IsActive);
        entity.HasIndex(x => x.CreatedAt);

        entity.HasOne(x => x.Icon)
            .WithMany(x => x.Achievements)
            .HasForeignKey(x => x.IconId)
            .OnDelete(DeleteBehavior.Restrict);
    }

    private static void ConfigureUserAchievements(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<UserAchievementEntity>();

        entity.ToTable("user_achievements");

        entity.HasKey(x => new { x.UserId, x.AchievementId });

        entity.Property(x => x.UserId)
            .HasColumnName("user_id")
            .IsRequired();

        entity.Property(x => x.AchievementId)
            .HasColumnName("achievement_id")
            .IsRequired();

        entity.Property(x => x.ProgressCurrent)
            .HasColumnName("progress_current")
            .IsRequired();

        entity.Property(x => x.ObtainedAt)
            .HasColumnName("obtained_at")
            .HasColumnType("timestamp with time zone");

        entity.Property(x => x.CreatedAt)
            .HasColumnName("created_at")
            .HasColumnType("timestamp with time zone")
            .HasDefaultValueSql("now()")
            .IsRequired();

        entity.Property(x => x.UpdatedAt)
            .HasColumnName("updated_at")
            .HasColumnType("timestamp with time zone")
            .HasDefaultValueSql("now()")
            .IsRequired();

        entity.HasIndex(x => x.UserId);
        entity.HasIndex(x => x.AchievementId);
        entity.HasIndex(x => x.ObtainedAt);

        entity.HasOne(x => x.Achievement)
            .WithMany(x => x.UserAchievements)
            .HasForeignKey(x => x.AchievementId)
            .OnDelete(DeleteBehavior.Cascade);
    }

    private static void ConfigureUserLevels(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<UserLevelEntity>();

        entity.ToTable("user_levels");

        entity.HasKey(x => x.UserId);

        entity.Property(x => x.UserId)
            .HasColumnName("user_id")
            .IsRequired();

        entity.Property(x => x.TotalXp)
            .HasColumnName("total_xp")
            .IsRequired();

        entity.Property(x => x.CurrentLevel)
            .HasColumnName("current_level")
            .IsRequired();

        entity.Property(x => x.UpdatedAt)
            .HasColumnName("updated_at")
            .HasColumnType("timestamp with time zone")
            .HasDefaultValueSql("now()")
            .IsRequired();

        entity.HasIndex(x => x.CurrentLevel);
        entity.HasIndex(x => x.TotalXp);
        entity.HasIndex(x => x.UpdatedAt);
    }
}