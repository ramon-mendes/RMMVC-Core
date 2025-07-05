using Microsoft.AspNetCore.Mvc;

namespace RM_MVC_Core.Controllers
{
	// PWAMeditation because PWA overlaps the wwwroot/pwa path
	public class PWAMeditationController : Controller
	{
		public IActionResult Index()
		{
			return View();
		}
	}
}
