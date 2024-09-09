using Microsoft.AspNetCore.Mvc;

namespace RM_MVC_Core.Controllers
{
    // PWAApp because PWA overlaps the wwwroot/pwa path
    public class PWAAppController : Controller
	{
		public IActionResult Index()
		{
			return View();
		}
	}
}
