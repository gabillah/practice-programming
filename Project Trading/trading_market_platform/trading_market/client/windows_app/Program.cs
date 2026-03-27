using System;
using System.Windows.Forms;
using TradingMarket.Client.Forms;
using TradingMarket.Client.Services;

namespace TradingMarket.Client
{
    internal static class Program
    {
        [STAThread]
        static void Main()
        {
            Application.SetHighDpiMode(HighDpiMode.SystemAware);
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            // Start with the login form
            Application.Run(new LoginForm());
        }
    }
}
