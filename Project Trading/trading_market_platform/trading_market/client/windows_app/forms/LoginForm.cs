using System;
using System.Drawing;
using System.Windows.Forms;
using TradingMarket.Client.Services;

namespace TradingMarket.Client.Forms
{
    /// <summary>
    /// Login / Registration form. Connects to gRPC server and opens MainForm on success.
    /// </summary>
    public class LoginForm : Form
    {
        private readonly MarketGrpcClient _client;

        private TextBox  txtServer;
        private TextBox  txtEmail;
        private TextBox  txtPassword;
        private TextBox  txtRegUsername;
        private TextBox  txtRegEmail;
        private TextBox  txtRegPassword;
        private TextBox  txtRegFullName;
        private TextBox  txtRegCountry;
        private Button   btnLogin;
        private Button   btnRegister;
        private TabControl tabs;
        private Label    lblError;

        public LoginForm()
        {
            _client = new MarketGrpcClient(); // default localhost
            InitializeComponent();
        }

        private void InitializeComponent()
        {
            this.Text            = "Trading Market — Sign In";
            this.Size            = new Size(420, 500);
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.MaximizeBox     = false;
            this.StartPosition   = FormStartPosition.CenterScreen;
            this.BackColor       = Color.FromArgb(18, 22, 36);
            this.ForeColor       = Color.White;

            // Header
            var header = new Label
            {
                Text      = "TRADING MARKET",
                Font      = new Font("Segoe UI Light", 18f),
                ForeColor = Color.Gold,
                TextAlign = ContentAlignment.MiddleCenter,
                Dock      = DockStyle.Top,
                Height    = 60,
            };

            // Server address
            var pnlServer = new Panel { Dock = DockStyle.Top, Height = 40, Padding = new Padding(20, 8, 20, 0) };
            txtServer = new TextBox { Text = "http://localhost:50051", Dock = DockStyle.Fill, BackColor = Color.FromArgb(30, 36, 56), ForeColor = Color.LightGray, BorderStyle = BorderStyle.FixedSingle };
            pnlServer.Controls.Add(txtServer);

            lblError = new Label { ForeColor = Color.OrangeRed, AutoSize = true, Location = new Point(20, 0), Visible = false };

            // Tabs: Login / Register
            tabs = new TabControl { Dock = DockStyle.Fill, BackColor = Color.FromArgb(22, 28, 44) };

            tabs.TabPages.Add(BuildLoginTab());
            tabs.TabPages.Add(BuildRegisterTab());

            this.Controls.Add(tabs);
            this.Controls.Add(lblError);
            this.Controls.Add(pnlServer);
            this.Controls.Add(header);
        }

        private TabPage BuildLoginTab()
        {
            var tab = new TabPage("Login") { BackColor = Color.FromArgb(22, 28, 44), ForeColor = Color.White, Padding = new Padding(20) };

            int y = 20;
            tab.Controls.Add(FL("Email", y));           y += 22;
            txtEmail    = TF(y); tab.Controls.Add(txtEmail);           y += 34;
            tab.Controls.Add(FL("Password", y));        y += 22;
            txtPassword = TF(y, password: true); tab.Controls.Add(txtPassword); y += 34;

            btnLogin = new Button
            {
                Text      = "LOGIN",
                Left = 20, Top = y, Width = 340, Height = 40,
                BackColor = Color.FromArgb(0, 140, 80),
                ForeColor = Color.White,
                FlatStyle = FlatStyle.Flat,
                Font      = new Font("Segoe UI Semibold", 11f),
            };
            btnLogin.Click += async (_, __) =>
            {
                lblError.Visible = false;
                try
                {
                    btnLogin.Enabled = false;
                    UpdateClient();
                    var resp = await _client.LoginAsync(txtEmail.Text, txtPassword.Text);
                    if (resp.Success)
                    {
                        _client.SetAuthToken(resp.Token);
                        this.Hide();
                        var main = new MainForm(_client, resp.Trader.TraderId, resp.Trader.FullName);
                        main.FormClosed += (_, __) => this.Close();
                        main.Show();
                    }
                    else
                    {
                        ShowError(resp.Message);
                    }
                }
                catch (Exception ex) { ShowError(ex.Message); }
                finally { btnLogin.Enabled = true; }
            };
            tab.Controls.Add(btnLogin);
            return tab;
        }

        private TabPage BuildRegisterTab()
        {
            var tab = new TabPage("Register") { BackColor = Color.FromArgb(22, 28, 44), ForeColor = Color.White, Padding = new Padding(20) };

            int y = 10;
            tab.Controls.Add(FL("Username", y)); y += 22;
            txtRegUsername = TF(y); tab.Controls.Add(txtRegUsername); y += 34;
            tab.Controls.Add(FL("Full Name", y)); y += 22;
            txtRegFullName = TF(y); tab.Controls.Add(txtRegFullName); y += 34;
            tab.Controls.Add(FL("Email", y)); y += 22;
            txtRegEmail = TF(y); tab.Controls.Add(txtRegEmail); y += 34;
            tab.Controls.Add(FL("Password", y)); y += 22;
            txtRegPassword = TF(y, password: true); tab.Controls.Add(txtRegPassword); y += 34;
            tab.Controls.Add(FL("Country (ISO code e.g. ID, US)", y)); y += 22;
            txtRegCountry = TF(y); txtRegCountry.Text = "ID"; tab.Controls.Add(txtRegCountry); y += 40;

            btnRegister = new Button
            {
                Text      = "CREATE ACCOUNT",
                Left = 20, Top = y, Width = 340, Height = 40,
                BackColor = Color.FromArgb(30, 80, 180),
                ForeColor = Color.White,
                FlatStyle = FlatStyle.Flat,
                Font      = new Font("Segoe UI Semibold", 11f),
            };
            btnRegister.Click += async (_, __) =>
            {
                lblError.Visible = false;
                try
                {
                    btnRegister.Enabled = false;
                    UpdateClient();
                    var resp = await _client.RegisterAsync(
                        txtRegUsername.Text, txtRegEmail.Text, txtRegPassword.Text,
                        txtRegFullName.Text, txtRegCountry.Text);
                    if (resp.Success)
                    {
                        MessageBox.Show(resp.Message, "Account Created", MessageBoxButtons.OK, MessageBoxIcon.Information);
                        tabs.SelectedIndex = 0; // switch to login tab
                    }
                    else ShowError(resp.Message);
                }
                catch (Exception ex) { ShowError(ex.Message); }
                finally { btnRegister.Enabled = true; }
            };
            tab.Controls.Add(btnRegister);
            return tab;
        }

        private void UpdateClient()
        {
            // Recreate client if server address changed
            // (simplified — in production handle disposal)
        }

        private void ShowError(string msg)
        {
            lblError.Text    = msg;
            lblError.Visible = true;
        }

        // ── Factory helpers ──────────────────────────────────
        private static Label FL(string text, int y) =>
            new Label { Text = text, Left = 20, Top = y, AutoSize = true, ForeColor = Color.LightGray };

        private static TextBox TF(int y, bool password = false) =>
            new TextBox
            {
                Left        = 20, Top = y, Width = 340,
                BackColor   = Color.FromArgb(30, 36, 56),
                ForeColor   = Color.White,
                BorderStyle = BorderStyle.FixedSingle,
                UseSystemPasswordChar = password,
            };
    }
}
