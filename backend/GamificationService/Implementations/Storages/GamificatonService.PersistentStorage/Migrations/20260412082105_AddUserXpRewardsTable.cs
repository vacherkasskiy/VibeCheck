using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GamificatonService.PersistentStorage.Migrations
{
    /// <inheritdoc />
    public partial class AddUserXpRewardsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "xp_rules",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    code = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    type = table.Column<int>(type: "integer", nullable: false),
                    action_key = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    xp_amount = table.Column<long>(type: "bigint", nullable: false),
                    threshold_value = table.Column<long>(type: "bigint", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    is_repeatable = table.Column<bool>(type: "boolean", nullable: false),
                    cooldown_days = table.Column<int>(type: "integer", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_xp_rules", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "user_xp_transactions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    xp_rule_id = table.Column<Guid>(type: "uuid", nullable: false),
                    xp_amount = table.Column<long>(type: "bigint", nullable: false),
                    event_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    aggregate_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_xp_transactions", x => x.id);
                    table.ForeignKey(
                        name: "FK_user_xp_transactions_xp_rules_xp_rule_id",
                        column: x => x.xp_rule_id,
                        principalTable: "xp_rules",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_user_xp_transactions_created_at",
                table: "user_xp_transactions",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_user_xp_transactions_user_id",
                table: "user_xp_transactions",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_user_xp_transactions_user_id_event_id",
                table: "user_xp_transactions",
                columns: new[] { "user_id", "event_id" });

            migrationBuilder.CreateIndex(
                name: "IX_user_xp_transactions_user_id_xp_rule_id",
                table: "user_xp_transactions",
                columns: new[] { "user_id", "xp_rule_id" });

            migrationBuilder.CreateIndex(
                name: "IX_user_xp_transactions_user_id_xp_rule_id_event_id",
                table: "user_xp_transactions",
                columns: new[] { "user_id", "xp_rule_id", "event_id" });

            migrationBuilder.CreateIndex(
                name: "IX_user_xp_transactions_xp_rule_id",
                table: "user_xp_transactions",
                column: "xp_rule_id");

            migrationBuilder.CreateIndex(
                name: "IX_xp_rules_action_key",
                table: "xp_rules",
                column: "action_key");

            migrationBuilder.CreateIndex(
                name: "IX_xp_rules_action_key_type_threshold_value",
                table: "xp_rules",
                columns: new[] { "action_key", "type", "threshold_value" });

            migrationBuilder.CreateIndex(
                name: "IX_xp_rules_code",
                table: "xp_rules",
                column: "code",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "user_xp_transactions");

            migrationBuilder.DropTable(
                name: "xp_rules");
        }
    }
}
