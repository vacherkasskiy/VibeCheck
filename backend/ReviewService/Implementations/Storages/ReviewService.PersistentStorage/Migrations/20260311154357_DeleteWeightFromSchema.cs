using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReviewService.PersistentStorage.Migrations
{
    /// <inheritdoc />
    public partial class DeleteWeightFromSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_companies_weight",
                table: "companies");

            migrationBuilder.DropColumn(
                name: "weight",
                table: "companies");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "weight",
                table: "companies",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.CreateIndex(
                name: "IX_companies_weight",
                table: "companies",
                column: "weight");
        }
    }
}
