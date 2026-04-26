using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReviewService.PersistentStorage.Migrations
{
    /// <inheritdoc />
    public partial class AddUserProfileVersionAndSex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "profile_version",
                table: "user_profiles",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<string>(
                name: "sex",
                table: "user_profiles",
                type: "character varying(32)",
                maxLength: 32,
                nullable: false,
                defaultValue: "Unknown");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "profile_version",
                table: "user_profiles");

            migrationBuilder.DropColumn(
                name: "sex",
                table: "user_profiles");
        }
    }
}
