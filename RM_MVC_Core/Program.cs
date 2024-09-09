using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;

class Program
{
	static void Main(string[] args)
	{
		var builder = WebApplication.CreateBuilder(args);

		// Add services to the container.
        builder.Services.AddControllersWithViews()
			.AddRazorRuntimeCompilation();

        var app = builder.Build();

		// Configure the HTTP request pipeline.
		if(!app.Environment.IsDevelopment())
		{
			app.UseExceptionHandler("/Home/Error");
			// The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
			app.UseHsts();
		}

		app.UseHttpsRedirection();

		{
			// Serve static files from the default wwwroot folder
			app.UseStaticFiles();

			/*
			// Serve static files from "static_route" folder
			app.UseStaticFiles(new StaticFileOptions
			{
				FileProvider = new PhysicalFileProvider(
					Path.Combine(builder.Environment.WebRootPath, "static_route")),
				RequestPath = "/static",
				ServeUnknownFileTypes = true,
				DefaultContentType = "text/html"
			});*/
		}

		app.UseRouting();

		app.UseAuthorization();

		app.MapControllerRoute(
			name: "default",
			pattern: "{controller=Home}/{action=Index}/{id?}");

		app.Run();
	}
}
