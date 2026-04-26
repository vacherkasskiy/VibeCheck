using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReviewService.PersistentStorage.Migrations
{
    /// <inheritdoc />
    public partial class AddUserFlagsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "user_profile_flags",
                columns: table => new
                {
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    flag_id = table.Column<Guid>(type: "uuid", nullable: false),
                    color = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    weight = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_profile_flags", x => new { x.user_id, x.flag_id });
                    table.CheckConstraint("ck_user_profile_flags_weight_range", "\"weight\" >= 1 AND \"weight\" <= 3");
                    table.ForeignKey(
                        name: "FK_user_profile_flags_flags_flag_id",
                        column: x => x.flag_id,
                        principalTable: "flags",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_user_profile_flags_user_profiles_user_id",
                        column: x => x.user_id,
                        principalTable: "user_profiles",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_user_profile_flags_flag_id",
                table: "user_profile_flags",
                column: "flag_id");

            migrationBuilder.CreateIndex(
                name: "IX_user_profile_flags_user_id_color",
                table: "user_profile_flags",
                columns: new[] { "user_id", "color" });

            migrationBuilder.CreateIndex(
                name: "IX_user_profile_flags_user_id_weight",
                table: "user_profile_flags",
                columns: new[] { "user_id", "weight" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "user_profile_flags");
        }
    }
}
