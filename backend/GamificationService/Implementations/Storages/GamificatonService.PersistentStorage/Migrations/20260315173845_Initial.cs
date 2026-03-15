using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace GamificatonService.PersistentStorage.Migrations
{
    /// <inheritdoc />
    public partial class Initial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "achievement_icons",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", maxLength: 128, nullable: false),
                    bucket = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    object_key = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: false),
                    content_type = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    etag = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    size_bytes = table.Column<long>(type: "bigint", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_achievement_icons", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "level_thresholds",
                columns: table => new
                {
                    level = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    xp_required_total = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_level_thresholds", x => x.level);
                });

            migrationBuilder.CreateTable(
                name: "user_levels",
                columns: table => new
                {
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    total_xp = table.Column<long>(type: "bigint", nullable: false),
                    current_level = table.Column<int>(type: "integer", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_levels", x => x.user_id);
                });

            migrationBuilder.CreateTable(
                name: "achievements",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    icon_id = table.Column<Guid>(type: "uuid", maxLength: 128, nullable: false),
                    target_value = table.Column<long>(type: "bigint", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_achievements", x => x.id);
                    table.ForeignKey(
                        name: "FK_achievements_achievement_icons_icon_id",
                        column: x => x.icon_id,
                        principalTable: "achievement_icons",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "user_achievements",
                columns: table => new
                {
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    achievement_id = table.Column<Guid>(type: "uuid", nullable: false),
                    progress_current = table.Column<long>(type: "bigint", nullable: false),
                    obtained_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_achievements", x => new { x.user_id, x.achievement_id });
                    table.ForeignKey(
                        name: "FK_user_achievements_achievements_achievement_id",
                        column: x => x.achievement_id,
                        principalTable: "achievements",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_achievement_icons_bucket_object_key",
                table: "achievement_icons",
                columns: new[] { "bucket", "object_key" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_achievement_icons_etag",
                table: "achievement_icons",
                column: "etag");

            migrationBuilder.CreateIndex(
                name: "IX_achievements_created_at",
                table: "achievements",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_achievements_icon_id",
                table: "achievements",
                column: "icon_id");

            migrationBuilder.CreateIndex(
                name: "IX_achievements_is_active",
                table: "achievements",
                column: "is_active");

            migrationBuilder.CreateIndex(
                name: "IX_level_thresholds_xp_required_total",
                table: "level_thresholds",
                column: "xp_required_total");

            migrationBuilder.CreateIndex(
                name: "IX_user_achievements_achievement_id",
                table: "user_achievements",
                column: "achievement_id");

            migrationBuilder.CreateIndex(
                name: "IX_user_achievements_obtained_at",
                table: "user_achievements",
                column: "obtained_at");

            migrationBuilder.CreateIndex(
                name: "IX_user_achievements_user_id",
                table: "user_achievements",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_user_levels_current_level",
                table: "user_levels",
                column: "current_level");

            migrationBuilder.CreateIndex(
                name: "IX_user_levels_total_xp",
                table: "user_levels",
                column: "total_xp");

            migrationBuilder.CreateIndex(
                name: "IX_user_levels_updated_at",
                table: "user_levels",
                column: "updated_at");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "level_thresholds");

            migrationBuilder.DropTable(
                name: "user_achievements");

            migrationBuilder.DropTable(
                name: "user_levels");

            migrationBuilder.DropTable(
                name: "achievements");

            migrationBuilder.DropTable(
                name: "achievement_icons");
        }
    }
}
