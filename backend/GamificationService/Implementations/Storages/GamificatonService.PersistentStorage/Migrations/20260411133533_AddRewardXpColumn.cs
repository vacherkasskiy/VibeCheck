using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GamificatonService.PersistentStorage.Migrations
{
    /// <inheritdoc />
    public partial class AddRewardXpColumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "xp_reward",
                table: "achievements",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "xp_reward",
                table: "achievements");
        }
    }
}
