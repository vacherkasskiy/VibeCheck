using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReviewService.PersistentStorage.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "flags",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_flags", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "icons",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    bucket = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    object_key = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: false),
                    content_type = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    etag = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    size_bytes = table.Column<long>(type: "bigint", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_icons", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "companies",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    icon_id = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: true),
                    weight = table.Column<double>(type: "double precision", nullable: false),
                    site_url = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: true),
                    linkedin_url = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: true),
                    hr_url = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_companies", x => x.id);
                    table.ForeignKey(
                        name: "FK_companies_icons_icon_id",
                        column: x => x.icon_id,
                        principalTable: "icons",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "company_requests",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    requester_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    icon_id = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: true),
                    site_url = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: true),
                    status = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    decided_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    decided_by_user_id = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_company_requests", x => x.id);
                    table.ForeignKey(
                        name: "FK_company_requests_icons_icon_id",
                        column: x => x.icon_id,
                        principalTable: "icons",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "user_profiles",
                columns: table => new
                {
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    icon_id = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: true),
                    display_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_profiles", x => x.user_id);
                    table.ForeignKey(
                        name: "FK_user_profiles_icons_icon_id",
                        column: x => x.icon_id,
                        principalTable: "icons",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "company_flags",
                columns: table => new
                {
                    company_id = table.Column<Guid>(type: "uuid", nullable: false),
                    flag_id = table.Column<Guid>(type: "uuid", nullable: false),
                    reviews_count = table.Column<long>(type: "bigint", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_company_flags", x => new { x.company_id, x.flag_id });
                    table.ForeignKey(
                        name: "FK_company_flags_companies_company_id",
                        column: x => x.company_id,
                        principalTable: "companies",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_company_flags_flags_flag_id",
                        column: x => x.flag_id,
                        principalTable: "flags",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "reviews",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    company_id = table.Column<Guid>(type: "uuid", nullable: false),
                    author_id = table.Column<Guid>(type: "uuid", nullable: false),
                    text = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    likes_count = table.Column<long>(type: "bigint", nullable: false),
                    dislikes_count = table.Column<long>(type: "bigint", nullable: false),
                    score = table.Column<long>(type: "bigint", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_reviews", x => x.id);
                    table.ForeignKey(
                        name: "FK_reviews_companies_company_id",
                        column: x => x.company_id,
                        principalTable: "companies",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_reviews_user_profiles_author_id",
                        column: x => x.author_id,
                        principalTable: "user_profiles",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "review_flags",
                columns: table => new
                {
                    review_id = table.Column<Guid>(type: "uuid", nullable: false),
                    flag_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_review_flags", x => new { x.review_id, x.flag_id });
                    table.ForeignKey(
                        name: "FK_review_flags_flags_flag_id",
                        column: x => x.flag_id,
                        principalTable: "flags",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_review_flags_reviews_review_id",
                        column: x => x.review_id,
                        principalTable: "reviews",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "review_reports",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    review_id = table.Column<Guid>(type: "uuid", nullable: false),
                    reporter_id = table.Column<Guid>(type: "uuid", nullable: false),
                    reason_type = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    reason_text = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_review_reports", x => x.id);
                    table.ForeignKey(
                        name: "FK_review_reports_reviews_review_id",
                        column: x => x.review_id,
                        principalTable: "reviews",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_review_reports_user_profiles_reporter_id",
                        column: x => x.reporter_id,
                        principalTable: "user_profiles",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "review_votes",
                columns: table => new
                {
                    review_id = table.Column<Guid>(type: "uuid", nullable: false),
                    voter_id = table.Column<Guid>(type: "uuid", nullable: false),
                    mode = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_review_votes", x => new { x.review_id, x.voter_id });
                    table.ForeignKey(
                        name: "FK_review_votes_reviews_review_id",
                        column: x => x.review_id,
                        principalTable: "reviews",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_review_votes_user_profiles_voter_id",
                        column: x => x.voter_id,
                        principalTable: "user_profiles",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_companies_icon_id",
                table: "companies",
                column: "icon_id");

            migrationBuilder.CreateIndex(
                name: "IX_companies_name",
                table: "companies",
                column: "name");

            migrationBuilder.CreateIndex(
                name: "IX_companies_weight",
                table: "companies",
                column: "weight");

            migrationBuilder.CreateIndex(
                name: "IX_company_flags_company_id_reviews_count",
                table: "company_flags",
                columns: new[] { "company_id", "reviews_count" });

            migrationBuilder.CreateIndex(
                name: "IX_company_flags_flag_id",
                table: "company_flags",
                column: "flag_id");

            migrationBuilder.CreateIndex(
                name: "IX_company_flags_reviews_count",
                table: "company_flags",
                column: "reviews_count");

            migrationBuilder.CreateIndex(
                name: "IX_company_requests_icon_id",
                table: "company_requests",
                column: "icon_id");

            migrationBuilder.CreateIndex(
                name: "IX_company_requests_requester_user_id",
                table: "company_requests",
                column: "requester_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_company_requests_status",
                table: "company_requests",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "IX_flags_name",
                table: "flags",
                column: "name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_icons_bucket_object_key",
                table: "icons",
                columns: new[] { "bucket", "object_key" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_review_flags_created_at",
                table: "review_flags",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_review_flags_flag_id",
                table: "review_flags",
                column: "flag_id");

            migrationBuilder.CreateIndex(
                name: "IX_review_reports_created_at",
                table: "review_reports",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_review_reports_reason_type",
                table: "review_reports",
                column: "reason_type");

            migrationBuilder.CreateIndex(
                name: "IX_review_reports_reporter_id",
                table: "review_reports",
                column: "reporter_id");

            migrationBuilder.CreateIndex(
                name: "IX_review_reports_review_id",
                table: "review_reports",
                column: "review_id");

            migrationBuilder.CreateIndex(
                name: "IX_review_votes_created_at",
                table: "review_votes",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_review_votes_mode",
                table: "review_votes",
                column: "mode");

            migrationBuilder.CreateIndex(
                name: "IX_review_votes_voter_id",
                table: "review_votes",
                column: "voter_id");

            migrationBuilder.CreateIndex(
                name: "IX_reviews_author_id",
                table: "reviews",
                column: "author_id");

            migrationBuilder.CreateIndex(
                name: "IX_reviews_company_id",
                table: "reviews",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "IX_reviews_company_id_created_at",
                table: "reviews",
                columns: new[] { "company_id", "created_at" });

            migrationBuilder.CreateIndex(
                name: "IX_reviews_company_id_score",
                table: "reviews",
                columns: new[] { "company_id", "score" });

            migrationBuilder.CreateIndex(
                name: "IX_reviews_created_at",
                table: "reviews",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_reviews_deleted_at",
                table: "reviews",
                column: "deleted_at");

            migrationBuilder.CreateIndex(
                name: "IX_reviews_score",
                table: "reviews",
                column: "score");

            migrationBuilder.CreateIndex(
                name: "IX_user_profiles_display_name",
                table: "user_profiles",
                column: "display_name");

            migrationBuilder.CreateIndex(
                name: "IX_user_profiles_icon_id",
                table: "user_profiles",
                column: "icon_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "company_flags");

            migrationBuilder.DropTable(
                name: "company_requests");

            migrationBuilder.DropTable(
                name: "review_flags");

            migrationBuilder.DropTable(
                name: "review_reports");

            migrationBuilder.DropTable(
                name: "review_votes");

            migrationBuilder.DropTable(
                name: "flags");

            migrationBuilder.DropTable(
                name: "reviews");

            migrationBuilder.DropTable(
                name: "companies");

            migrationBuilder.DropTable(
                name: "user_profiles");

            migrationBuilder.DropTable(
                name: "icons");
        }
    }
}
