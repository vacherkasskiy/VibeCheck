using Microsoft.EntityFrameworkCore;
using ReviewService.PersistentStorage.Entities;

namespace ReviewService.PersistentStorage;

public sealed class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<FlagEntity> Flags => Set<FlagEntity>();
    public DbSet<IconEntity> Icons => Set<IconEntity>();
    public DbSet<CompanyEntity> Companies => Set<CompanyEntity>();
    public DbSet<CompanyRequestEntity> CompanyRequests => Set<CompanyRequestEntity>();
    public DbSet<UserProfileEntity> UserProfiles => Set<UserProfileEntity>();
    public DbSet<UserWorkExperienceEntity> UserWorkExperiences => Set<UserWorkExperienceEntity>();
    public DbSet<ReviewEntity> Reviews => Set<ReviewEntity>();
    public DbSet<CompanyFlagEntity> CompanyFlags => Set<CompanyFlagEntity>();
    public DbSet<ReviewFlagEntity> ReviewFlags => Set<ReviewFlagEntity>();
    public DbSet<ReviewVoteEntity> ReviewVotes => Set<ReviewVoteEntity>();
    public DbSet<ReviewReportEntity> ReviewReports => Set<ReviewReportEntity>();
    public DbSet<UserProfileFlagEntity> UserProfileFlags => Set<UserProfileFlagEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        ConfigureFlags(modelBuilder);
        ConfigureIcons(modelBuilder);
        ConfigureCompanies(modelBuilder);
        ConfigureCompanyRequests(modelBuilder);
        ConfigureUserProfiles(modelBuilder);
        ConfigureUserWorkExperience(modelBuilder);
        ConfigureReviews(modelBuilder);
        ConfigureCompanyFlags(modelBuilder);
        ConfigureReviewFlags(modelBuilder);
        ConfigureReviewVotes(modelBuilder);
        ConfigureReviewReports(modelBuilder);
        ConfigureUserProfileFlags(modelBuilder);

        base.OnModelCreating(modelBuilder);
    }
    
    private static void ConfigureUserProfileFlags(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<UserProfileFlagEntity>();

        entity.ToTable("user_profile_flags");

        entity.HasKey(x => new { x.UserId, x.FlagId });

        entity.Property(x => x.UserId)
            .HasColumnName("user_id")
            .IsRequired();

        entity.Property(x => x.FlagId)
            .HasColumnName("flag_id")
            .IsRequired();

        entity.Property(x => x.Color)
            .HasColumnName("color")
            .HasMaxLength(16)
            .HasConversion<string>()
            .IsRequired();

        entity.Property(x => x.Weight)
            .HasColumnName("priority")
            .IsRequired();

        entity.Property(x => x.CreatedAt)
            .HasColumnName("created_at")
            .HasColumnType("timestamp with time zone")
            .HasDefaultValueSql("now()")
            .IsRequired();

        entity.ToTable(t =>
        {
            t.HasCheckConstraint("ck_user_profile_flags_priority_positive", "\"priority\" > 0");
            t.HasCheckConstraint("ck_user_profile_flags_weight_range", "\"weight\" >= 1 AND \"weight\" <= 3");
        });

        entity.HasIndex(x => x.FlagId);
        entity.HasIndex(x => new { x.UserId, x.Color });
        entity.HasIndex(x => new { x.UserId, Priority = x.Weight });

        entity.HasOne(x => x.User)
            .WithMany(x => x.UserFlags)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        entity.HasOne(x => x.Flag)
            .WithMany(x => x.UserProfileFlags)
            .HasForeignKey(x => x.FlagId)
            .OnDelete(DeleteBehavior.Restrict);
    }

    private static void ConfigureFlags(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<FlagEntity>();

        entity.ToTable("flags");

        entity.HasKey(x => x.Id);

        entity.Property(x => x.Id)
            .HasColumnName("id");

        entity.Property(x => x.Name)
            .HasColumnName("name")
            .HasMaxLength(128)
            .IsRequired();

        entity.Property(x => x.Category)
            .HasColumnName("category")
            .HasMaxLength(64)
            .HasConversion<string>()
            .IsRequired();

        entity.Property(x => x.Description)
            .HasColumnName("description")
            .HasColumnType("text")
            .IsRequired();

        entity.Property(x => x.CreatedAt)
            .HasColumnName("created_at")
            .HasColumnType("timestamp with time zone")
            .HasDefaultValueSql("now()")
            .IsRequired();

        entity.HasIndex(x => x.Name).IsUnique();
        entity.HasIndex(x => x.Category);
    }

    private static void ConfigureIcons(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<IconEntity>();

        entity.ToTable("icons");

        entity.HasKey(x => x.Id);

        entity.Property(x => x.Id)
            .HasColumnName("id");

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

        entity.HasIndex(x => new { x.Bucket, x.ObjectKey }).IsUnique();
    }

    private static void ConfigureCompanies(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<CompanyEntity>();

        entity.ToTable("companies");

        entity.HasKey(x => x.Id);

        entity.Property(x => x.Id).HasColumnName("id");

        entity.Property(x => x.Name)
            .HasColumnName("name")
            .HasMaxLength(200)
            .IsRequired();

        entity.Property(x => x.Description)
            .HasColumnName("description")
            .HasColumnType("text");

        entity.Property(x => x.IconId)
            .HasColumnName("icon_id");

        entity.Property(x => x.SiteUrl)
            .HasColumnName("site_url")
            .HasMaxLength(512);

        entity.Property(x => x.LinkedinUrl)
            .HasColumnName("linkedin_url")
            .HasMaxLength(512);

        entity.Property(x => x.HrUrl)
            .HasColumnName("hr_url")
            .HasMaxLength(512);

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

        entity.HasIndex(x => x.Name);
        entity.HasIndex(x => x.IconId);

        entity.HasOne(x => x.Icon)
            .WithMany(x => x.Companies)
            .HasForeignKey(x => x.IconId)
            .OnDelete(DeleteBehavior.SetNull);
    }

    private static void ConfigureCompanyRequests(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<CompanyRequestEntity>();

        entity.ToTable("company_requests");

        entity.HasKey(x => x.Id);

        entity.Property(x => x.Id).HasColumnName("id");

        entity.Property(x => x.RequesterUserId)
            .HasColumnName("requester_user_id")
            .IsRequired();

        entity.Property(x => x.Name)
            .HasColumnName("name")
            .HasMaxLength(200)
            .IsRequired();

        entity.Property(x => x.SiteUrl)
            .HasColumnName("site_url")
            .HasMaxLength(512);

        entity.Property(x => x.Status)
            .HasColumnName("status")
            .HasMaxLength(32)
            .IsRequired();

        entity.Property(x => x.CreatedAt)
            .HasColumnName("created_at")
            .HasColumnType("timestamp with time zone")
            .HasDefaultValueSql("now()")
            .IsRequired();

        entity.Property(x => x.DecidedAt)
            .HasColumnName("decided_at")
            .HasColumnType("timestamp with time zone");

        entity.Property(x => x.DecidedByUserId)
            .HasColumnName("decided_by_user_id");

        entity.HasIndex(x => x.RequesterUserId);
        entity.HasIndex(x => x.Status);
    }

    private static void ConfigureUserProfiles(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<UserProfileEntity>();

        entity.ToTable("user_profiles");

        entity.HasKey(x => x.UserId);

        entity.Property(x => x.UserId).HasColumnName("user_id");

        entity.Property(x => x.IconId)
            .HasColumnName("icon_id")
            .HasMaxLength(128);

        entity.Property(x => x.DisplayName)
            .HasColumnName("display_name")
            .HasMaxLength(200);

        entity.Property(x => x.Birthday)
            .HasColumnName("birthday")
            .HasColumnType("timestamp with time zone");

        entity.Property(x => x.Education)
            .HasColumnName("education")
            .HasMaxLength(64)
            .HasConversion<string>()
            .IsRequired();

        entity.Property(x => x.Specialization)
            .HasColumnName("specialization")
            .HasMaxLength(64)
            .HasConversion<string>()
            .IsRequired();

        entity.Property(x => x.UpdatedAt)
            .HasColumnName("updated_at")
            .HasColumnType("timestamp with time zone")
            .HasDefaultValueSql("now()")
            .IsRequired();
    }

    private static void ConfigureUserWorkExperience(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<UserWorkExperienceEntity>();

        entity.ToTable("user_work_experience");

        entity.HasKey(x => x.Id);

        entity.Property(x => x.Id).HasColumnName("id");

        entity.Property(x => x.UserId)
            .HasColumnName("user_id")
            .IsRequired();

        entity.Property(x => x.Specialization)
            .HasColumnName("specialization")
            .HasMaxLength(64)
            .HasConversion<string>()
            .IsRequired();

        entity.Property(x => x.StartedAt)
            .HasColumnName("started_at")
            .HasColumnType("timestamp with time zone")
            .IsRequired();

        entity.Property(x => x.FinishedAt)
            .HasColumnName("finished_at")
            .HasColumnType("timestamp with time zone");

        entity.HasIndex(x => x.UserId);

        entity.HasOne(x => x.User)
            .WithMany(x => x.WorkExperience)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }

    private static void ConfigureReviews(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<ReviewEntity>();

        entity.ToTable("reviews");

        entity.HasKey(x => x.Id);

        entity.Property(x => x.Id).HasColumnName("id");

        entity.Property(x => x.CompanyId)
            .HasColumnName("company_id")
            .IsRequired();

        entity.Property(x => x.AuthorId)
            .HasColumnName("author_id")
            .IsRequired();

        entity.Property(x => x.Text)
            .HasColumnName("text")
            .HasMaxLength(1000);

        entity.Property(x => x.LikesCount)
            .HasColumnName("likes_count")
            .IsRequired();

        entity.Property(x => x.DislikesCount)
            .HasColumnName("dislikes_count")
            .IsRequired();

        entity.Property(x => x.Score)
            .HasColumnName("score")
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

        entity.Property(x => x.DeletedAt)
            .HasColumnName("deleted_at")
            .HasColumnType("timestamp with time zone");

        entity.HasIndex(x => x.CompanyId);
        entity.HasIndex(x => x.AuthorId);
        entity.HasIndex(x => x.CreatedAt);
        entity.HasIndex(x => x.Score);
        entity.HasIndex(x => x.DeletedAt);
        entity.HasIndex(x => new { x.CompanyId, x.CreatedAt });
        entity.HasIndex(x => new { x.CompanyId, x.Score });

        entity.HasOne(x => x.Company)
            .WithMany(x => x.Reviews)
            .HasForeignKey(x => x.CompanyId)
            .OnDelete(DeleteBehavior.Restrict);

        entity.HasOne(x => x.Author)
            .WithMany(x => x.AuthoredReviews)
            .HasForeignKey(x => x.AuthorId)
            .OnDelete(DeleteBehavior.Restrict);
    }

    private static void ConfigureCompanyFlags(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<CompanyFlagEntity>();

        entity.ToTable("company_flags");

        entity.HasKey(x => new { x.CompanyId, x.FlagId });

        entity.Property(x => x.CompanyId)
            .HasColumnName("company_id")
            .IsRequired();

        entity.Property(x => x.FlagId)
            .HasColumnName("flag_id")
            .IsRequired();

        entity.Property(x => x.ReviewsCount)
            .HasColumnName("reviews_count")
            .IsRequired();

        entity.Property(x => x.UpdatedAt)
            .HasColumnName("updated_at")
            .HasColumnType("timestamp with time zone")
            .HasDefaultValueSql("now()")
            .IsRequired();

        entity.HasIndex(x => x.FlagId);
        entity.HasIndex(x => x.ReviewsCount);
        entity.HasIndex(x => new { x.CompanyId, x.ReviewsCount });

        entity.HasOne(x => x.Company)
            .WithMany(x => x.CompanyFlags)
            .HasForeignKey(x => x.CompanyId)
            .OnDelete(DeleteBehavior.Cascade);

        entity.HasOne(x => x.Flag)
            .WithMany(x => x.CompanyFlags)
            .HasForeignKey(x => x.FlagId)
            .OnDelete(DeleteBehavior.Restrict);
    }

    private static void ConfigureReviewFlags(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<ReviewFlagEntity>();

        entity.ToTable("review_flags");

        entity.HasKey(x => new { x.ReviewId, x.FlagId });

        entity.Property(x => x.ReviewId)
            .HasColumnName("review_id")
            .IsRequired();

        entity.Property(x => x.FlagId)
            .HasColumnName("flag_id")
            .IsRequired();

        entity.Property(x => x.CreatedAt)
            .HasColumnName("created_at")
            .HasColumnType("timestamp with time zone")
            .HasDefaultValueSql("now()")
            .IsRequired();

        entity.HasIndex(x => x.FlagId);

        entity.HasOne(x => x.Review)
            .WithMany(x => x.ReviewFlags)
            .HasForeignKey(x => x.ReviewId)
            .OnDelete(DeleteBehavior.Cascade);

        entity.HasOne(x => x.Flag)
            .WithMany(x => x.ReviewFlags)
            .HasForeignKey(x => x.FlagId)
            .OnDelete(DeleteBehavior.Restrict);
    }

    private static void ConfigureReviewVotes(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<ReviewVoteEntity>();

        entity.ToTable("review_votes");

        entity.HasKey(x => new { x.ReviewId, x.VoterId });

        entity.Property(x => x.ReviewId)
            .HasColumnName("review_id")
            .IsRequired();

        entity.Property(x => x.VoterId)
            .HasColumnName("voter_id")
            .IsRequired();

        entity.Property(x => x.Mode)
            .HasColumnName("mode")
            .HasMaxLength(16)
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

        entity.HasIndex(x => x.VoterId);
        entity.HasIndex(x => x.Mode);
        entity.HasIndex(x => x.CreatedAt);

        entity.HasOne(x => x.Review)
            .WithMany(x => x.ReviewVotes)
            .HasForeignKey(x => x.ReviewId)
            .OnDelete(DeleteBehavior.Cascade);

        entity.HasOne(x => x.Voter)
            .WithMany(x => x.ReviewVotes)
            .HasForeignKey(x => x.VoterId)
            .OnDelete(DeleteBehavior.Restrict);
    }

    private static void ConfigureReviewReports(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<ReviewReportEntity>();

        entity.ToTable("review_reports");

        entity.HasKey(x => x.Id);

        entity.Property(x => x.Id).HasColumnName("id");

        entity.Property(x => x.ReviewId)
            .HasColumnName("review_id")
            .IsRequired();

        entity.Property(x => x.ReporterId)
            .HasColumnName("reporter_id")
            .IsRequired();

        entity.Property(x => x.ReasonType)
            .HasColumnName("reason_type")
            .HasMaxLength(64)
            .IsRequired();

        entity.Property(x => x.ReasonText)
            .HasColumnName("reason_text")
            .HasMaxLength(1000);

        entity.Property(x => x.CreatedAt)
            .HasColumnName("created_at")
            .HasColumnType("timestamp with time zone")
            .HasDefaultValueSql("now()")
            .IsRequired();

        entity.HasIndex(x => x.ReviewId);
        entity.HasIndex(x => x.ReporterId);
        entity.HasIndex(x => x.ReasonType);
        entity.HasIndex(x => x.CreatedAt);

        entity.HasOne(x => x.Review)
            .WithMany(x => x.ReviewReports)
            .HasForeignKey(x => x.ReviewId)
            .OnDelete(DeleteBehavior.Cascade);

        entity.HasOne(x => x.Reporter)
            .WithMany(x => x.ReviewReports)
            .HasForeignKey(x => x.ReporterId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}