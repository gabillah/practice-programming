using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;
using Market;
using TradingMarket.Client.Services;

namespace TradingMarket.Client.Forms
{
    /// <summary>
    /// Main trading dashboard: market status bar, price watch, order placement, order blotter.
    /// </summary>
    public partial class MainForm : Form
    {
        // ─── Fields ──────────────────────────────────────────────────────────────

        private readonly MarketGrpcClient _client;
        private readonly string           _traderId;
        private readonly string           _traderName;

        private CancellationTokenSource _streamCts = new();

        // UI controls declared here (would normally be in the .designer.cs)
        private Label          lblStatus;
        private Label          lblStatusDetail;
        private Label          lblBalance;
        private DataGridView   dgvPrices;
        private DataGridView   dgvOrders;
        private ComboBox       cboSymbol;
        private ComboBox       cboSide;
        private ComboBox       cboType;
        private NumericUpDown  nudQty;
        private NumericUpDown  nudPrice;
        private Button         btnPlace;
        private Button         btnCancel;
        private Button         btnRefreshOrders;
        private StatusStrip    statusStrip;
        private ToolStripStatusLabel tsStatus;
        private System.Windows.Forms.Timer tmrStatus;

        // ─── Constructor ─────────────────────────────────────────────────────────

        public MainForm(MarketGrpcClient client, string traderId, string traderName)
        {
            _client     = client;
            _traderId   = traderId;
            _traderName = traderName;
            InitializeComponent();
            this.Text = $"Trading Market — {traderName}";
        }

        // ─── Initialization ───────────────────────────────────────────────────────

        private void InitializeComponent()
        {
            this.Size            = new Size(1200, 800);
            this.MinimumSize     = new Size(900, 600);
            this.BackColor       = Color.FromArgb(18, 22, 36);
            this.ForeColor       = Color.White;
            this.Font            = new Font("Segoe UI", 9f);
            this.StartPosition   = FormStartPosition.CenterScreen;

            BuildStatusBar();
            BuildPricePanel();
            BuildOrderEntryPanel();
            BuildOrderBlotter();

            _ = LoadInitialDataAsync();
            StartStreaming();

            // Poll market status every 10 s
            tmrStatus          = new System.Windows.Forms.Timer { Interval = 10_000 };
            tmrStatus.Tick    += async (_, __) => await UpdateMarketStatusAsync();
            tmrStatus.Start();
        }

        // ─── UI Builders ──────────────────────────────────────────────────────────

        private void BuildStatusBar()
        {
            // Top status panel
            var topPanel = new Panel
            {
                Dock      = DockStyle.Top,
                Height    = 50,
                BackColor = Color.FromArgb(10, 14, 26),
                Padding   = new Padding(10, 8, 10, 8),
            };
            lblStatus = new Label
            {
                Text      = "● Checking market…",
                Font      = new Font("Segoe UI Semibold", 11f),
                ForeColor = Color.Gold,
                AutoSize  = true,
                Location  = new Point(10, 12),
            };
            lblBalance = new Label
            {
                Text      = "Balance: —",
                Font      = new Font("Segoe UI", 10f),
                ForeColor = Color.LightCyan,
                AutoSize  = true,
                Location  = new Point(400, 14),
            };
            lblStatusDetail = new Label
            {
                Text      = "",
                Font      = new Font("Segoe UI", 9f),
                ForeColor = Color.OrangeRed,
                AutoSize  = true,
                Location  = new Point(10, 32),
            };
            topPanel.Controls.AddRange(new Control[] { lblStatus, lblBalance, lblStatusDetail });
            this.Controls.Add(topPanel);
        }

        private void BuildPricePanel()
        {
            var panel = new Panel
            {
                Dock        = DockStyle.Left,
                Width       = 500,
                Padding     = new Padding(8),
                BackColor   = Color.FromArgb(22, 28, 44),
            };
            var title = new Label
            {
                Text      = "LIVE PRICES",
                Font      = new Font("Segoe UI Semibold", 10f),
                ForeColor = Color.LightGray,
                Dock      = DockStyle.Top,
                Height    = 26,
                TextAlign = ContentAlignment.MiddleLeft,
            };
            dgvPrices = BuildDgv(new[]
            {
                ("Symbol",   80), ("Last",    90), ("Bid", 80), ("Ask", 80),
                ("Change%",  70), ("Volume", 80), ("High", 80), ("Low", 80),
            });
            dgvPrices.Dock = DockStyle.Fill;
            panel.Controls.Add(dgvPrices);
            panel.Controls.Add(title);
            this.Controls.Add(panel);
        }

        private void BuildOrderEntryPanel()
        {
            var panel = new Panel
            {
                Dock        = DockStyle.Right,
                Width       = 280,
                Padding     = new Padding(10),
                BackColor   = Color.FromArgb(22, 28, 44),
            };

            int y = 10;
            panel.Controls.Add(MakeLabel("PLACE ORDER", y, bold: true)); y += 28;

            panel.Controls.Add(MakeLabel("Symbol", y)); y += 22;
            cboSymbol = new ComboBox { Left = 10, Top = y, Width = 240, DropDownStyle = ComboBoxStyle.DropDownList, BackColor = Color.FromArgb(30, 36, 56), ForeColor = Color.White };
            panel.Controls.Add(cboSymbol); y += 32;

            panel.Controls.Add(MakeLabel("Side", y)); y += 22;
            cboSide = new ComboBox { Left = 10, Top = y, Width = 240, DropDownStyle = ComboBoxStyle.DropDownList, BackColor = Color.FromArgb(30, 36, 56), ForeColor = Color.White };
            cboSide.Items.AddRange(new object[] { "BUY", "SELL" });
            cboSide.SelectedIndex = 0;
            panel.Controls.Add(cboSide); y += 32;

            panel.Controls.Add(MakeLabel("Order Type", y)); y += 22;
            cboType = new ComboBox { Left = 10, Top = y, Width = 240, DropDownStyle = ComboBoxStyle.DropDownList, BackColor = Color.FromArgb(30, 36, 56), ForeColor = Color.White };
            cboType.Items.AddRange(new object[] { "MARKET", "LIMIT", "STOP" });
            cboType.SelectedIndex = 0;
            panel.Controls.Add(cboType); y += 32;

            panel.Controls.Add(MakeLabel("Quantity (lots)", y)); y += 22;
            nudQty = new NumericUpDown { Left = 10, Top = y, Width = 240, Minimum = 1, Maximum = 1_000_000, Value = 100, BackColor = Color.FromArgb(30, 36, 56), ForeColor = Color.White };
            panel.Controls.Add(nudQty); y += 32;

            panel.Controls.Add(MakeLabel("Price (IDR)", y)); y += 22;
            nudPrice = new NumericUpDown { Left = 10, Top = y, Width = 240, Minimum = 0, Maximum = 100_000_000, DecimalPlaces = 0, Value = 10000, BackColor = Color.FromArgb(30, 36, 56), ForeColor = Color.White };
            panel.Controls.Add(nudPrice); y += 40;

            btnPlace = new Button
            {
                Text      = "PLACE ORDER",
                Left = 10, Top = y, Width = 240, Height = 38,
                BackColor = Color.FromArgb(0, 180, 100),
                ForeColor = Color.White,
                FlatStyle = FlatStyle.Flat,
                Font      = new Font("Segoe UI Semibold", 10f),
            };
            btnPlace.Click += async (_, __) => await PlaceOrderAsync();
            panel.Controls.Add(btnPlace); y += 50;

            btnCancel = new Button
            {
                Text      = "CANCEL SELECTED ORDER",
                Left = 10, Top = y, Width = 240, Height = 34,
                BackColor = Color.FromArgb(180, 40, 40),
                ForeColor = Color.White,
                FlatStyle = FlatStyle.Flat,
            };
            btnCancel.Click += async (_, __) => await CancelSelectedOrderAsync();
            panel.Controls.Add(btnCancel);

            this.Controls.Add(panel);
        }

        private void BuildOrderBlotter()
        {
            var panel = new Panel { Dock = DockStyle.Fill, Padding = new Padding(8), BackColor = Color.FromArgb(18, 22, 36) };
            var title = new Label { Text = "MY ORDERS", Font = new Font("Segoe UI Semibold", 10f), ForeColor = Color.LightGray, Dock = DockStyle.Top, Height = 26, TextAlign = ContentAlignment.MiddleLeft };
            btnRefreshOrders = new Button { Text = "↺ Refresh", Dock = DockStyle.Top, Height = 28, BackColor = Color.FromArgb(30, 36, 56), ForeColor = Color.LightGray, FlatStyle = FlatStyle.Flat };
            btnRefreshOrders.Click += async (_, __) => await LoadOrdersAsync();

            dgvOrders = BuildDgv(new[]
            {
                ("OrderID", 120), ("Symbol", 80), ("Side", 50), ("Type", 60),
                ("Status", 80), ("Qty", 70), ("Price", 90), ("Filled", 70), ("AvgFill", 90),
            });
            dgvOrders.Dock = DockStyle.Fill;

            panel.Controls.Add(dgvOrders);
            panel.Controls.Add(btnRefreshOrders);
            panel.Controls.Add(title);
            this.Controls.Add(panel);
        }

        // ─── Data loading ─────────────────────────────────────────────────────────

        private async Task LoadInitialDataAsync()
        {
            await UpdateMarketStatusAsync();

            try
            {
                var secs = await _client.ListSecuritiesAsync();
                foreach (var s in secs.Securities)
                    cboSymbol.Items.Add(s.Symbol);
                if (cboSymbol.Items.Count > 0) cboSymbol.SelectedIndex = 0;

                // Seed price grid
                dgvPrices.Rows.Clear();
                foreach (var s in secs.Securities)
                {
                    var pr = await _client.GetPriceAsync(s.Symbol);
                    AddOrUpdatePriceRow(pr.Price);
                }
            }
            catch (Exception ex)
            {
                tsStatus?.SetText($"Error loading data: {ex.Message}");
            }

            await LoadOrdersAsync();
        }

        private async Task UpdateMarketStatusAsync()
        {
            try
            {
                var resp = await _client.GetMarketStatusAsync();
                var ms   = resp.Status;
                this.Invoke((MethodInvoker)(() =>
                {
                    if (!ms.IsOpen)
                    {
                        lblStatus.Text      = "● MARKET CLOSED";
                        lblStatus.ForeColor = Color.Gray;
                        lblStatusDetail.Text = $"Trading hours: {ms.OpenTime}–{ms.CloseTime} {ms.Timezone}";
                    }
                    else if (ms.TradingHalted)
                    {
                        lblStatus.Text      = "⚠ TRADING HALTED";
                        lblStatus.ForeColor = Color.OrangeRed;
                        lblStatusDetail.Text = ms.HaltReason;
                    }
                    else
                    {
                        lblStatus.Text      = "● MARKET OPEN";
                        lblStatus.ForeColor = Color.LimeGreen;
                        lblStatusDetail.Text = $"Circuit breaker at {ms.CircuitBreakerThreshold:0}%  |  Closes {ms.CloseTime}";
                    }
                }));
            }
            catch { /* server may be temporarily unreachable */ }
        }

        private async Task LoadOrdersAsync()
        {
            try
            {
                var resp = await _client.ListOrdersAsync(_traderId);
                this.Invoke((MethodInvoker)(() =>
                {
                    dgvOrders.Rows.Clear();
                    foreach (var o in resp.Orders)
                    {
                        dgvOrders.Rows.Add(
                            o.OrderId[..8], o.Symbol,
                            o.Side.ToString().Replace("OrderSide", ""),
                            o.Type.ToString().Replace("OrderType", ""),
                            o.Status.ToString().Replace("OrderStatus", ""),
                            o.Quantity, o.Price.ToString("N0"),
                            o.FilledQty, o.AvgFillPrice.ToString("N0"));
                    }
                }));
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Failed to load orders: {ex.Message}", "Error", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            }
        }

        // ─── Streaming ────────────────────────────────────────────────────────────

        private void StartStreaming()
        {
            _streamCts = new CancellationTokenSource();
            var ct     = _streamCts.Token;

            Task.Run(async () =>
            {
                try
                {
                    var symbols = new List<string> { "MYCO-A", "MYCO-B", "MYCO-C", "MYCO-D" };
                    await _client.SubscribePricesAsync(symbols, price =>
                    {
                        this.Invoke((MethodInvoker)(() => AddOrUpdatePriceRow(price)));
                    }, ct);
                }
                catch (OperationCanceledException) { }
                catch { /* reconnect logic would go here */ }
            }, ct);
        }

        private void AddOrUpdatePriceRow(Price p)
        {
            foreach (DataGridViewRow row in dgvPrices.Rows)
            {
                if (row.Cells[0].Value?.ToString() == p.Symbol)
                {
                    row.Cells[1].Value = p.Last.ToString("N0");
                    row.Cells[2].Value = p.Bid.ToString("N0");
                    row.Cells[3].Value = p.Ask.ToString("N0");
                    row.Cells[4].Value = $"{p.ChangePct:+0.00;-0.00;0.00}%";
                    row.Cells[5].Value = p.Volume.ToString("N0");
                    row.Cells[6].Value = p.High.ToString("N0");
                    row.Cells[7].Value = p.Low.ToString("N0");

                    // Colour code change
                    row.Cells[4].Style.ForeColor = p.ChangePct >= 0 ? Color.LimeGreen : Color.OrangeRed;

                    // Circuit breaker warning colour
                    if (p.ChangePct <= -4.5)
                        row.DefaultCellStyle.BackColor = Color.FromArgb(80, 30, 30);
                    else
                        row.DefaultCellStyle.BackColor = Color.Transparent;
                    return;
                }
            }
            // New row
            var idx = dgvPrices.Rows.Add(
                p.Symbol, p.Last.ToString("N0"), p.Bid.ToString("N0"), p.Ask.ToString("N0"),
                $"{p.ChangePct:+0.00;-0.00;0.00}%", p.Volume.ToString("N0"),
                p.High.ToString("N0"), p.Low.ToString("N0"));
            dgvPrices.Rows[idx].Cells[4].Style.ForeColor = p.ChangePct >= 0 ? Color.LimeGreen : Color.OrangeRed;
        }

        // ─── Order actions ────────────────────────────────────────────────────────

        private async Task PlaceOrderAsync()
        {
            if (cboSymbol.SelectedItem == null) { MessageBox.Show("Select a symbol."); return; }

            var symbol = cboSymbol.SelectedItem.ToString()!;
            var side   = cboSide.SelectedIndex == 0 ? OrderSide.OrderSideBuy : OrderSide.OrderSideSell;
            var type   = (OrderType)(cboType.SelectedIndex + 1);
            var qty    = (double)nudQty.Value;
            var price  = (double)nudPrice.Value;

            try
            {
                btnPlace.Enabled = false;
                var resp = await _client.PlaceOrderAsync(_traderId, symbol, side, type, qty, price);
                MessageBox.Show(resp.Message, resp.Success ? "Order Placed" : "Order Rejected",
                    MessageBoxButtons.OK, resp.Success ? MessageBoxIcon.Information : MessageBoxIcon.Warning);
                if (resp.Success) await LoadOrdersAsync();
            }
            catch (Exception ex)
            {
                MessageBox.Show($"gRPC error: {ex.Message}", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
            finally { btnPlace.Enabled = true; }
        }

        private async Task CancelSelectedOrderAsync()
        {
            if (dgvOrders.SelectedRows.Count == 0) { MessageBox.Show("Select an order to cancel."); return; }
            var orderId = dgvOrders.SelectedRows[0].Cells[0].Value?.ToString();
            if (string.IsNullOrEmpty(orderId)) return;

            // Note: orderId is trimmed to 8 chars in the display; for a production app store full IDs separately.
            var resp = await _client.CancelOrderAsync(orderId, _traderId);
            MessageBox.Show(resp.Message, resp.Success ? "Cancelled" : "Error");
            if (resp.Success) await LoadOrdersAsync();
        }

        // ─── Helpers ──────────────────────────────────────────────────────────────

        private static DataGridView BuildDgv(IEnumerable<(string name, int width)> columns)
        {
            var dgv = new DataGridView
            {
                ReadOnly              = true,
                AllowUserToAddRows    = false,
                AllowUserToDeleteRows = false,
                SelectionMode         = DataGridViewSelectionMode.FullRowSelect,
                BackgroundColor       = Color.FromArgb(18, 22, 36),
                GridColor             = Color.FromArgb(40, 46, 66),
                BorderStyle           = BorderStyle.None,
                RowHeadersVisible     = false,
                AutoSizeRowsMode      = DataGridViewAutoSizeRowsMode.AllCells,
            };
            dgv.ColumnHeadersDefaultCellStyle.BackColor  = Color.FromArgb(10, 14, 26);
            dgv.ColumnHeadersDefaultCellStyle.ForeColor  = Color.LightGray;
            dgv.ColumnHeadersDefaultCellStyle.Font       = new Font("Segoe UI Semibold", 8.5f);
            dgv.DefaultCellStyle.BackColor                = Color.FromArgb(18, 22, 36);
            dgv.DefaultCellStyle.ForeColor                = Color.White;
            dgv.DefaultCellStyle.SelectionBackColor       = Color.FromArgb(0, 100, 180);
            dgv.DefaultCellStyle.SelectionForeColor       = Color.White;
            dgv.EnableHeadersVisualStyles                 = false;

            foreach (var (name, width) in columns)
                dgv.Columns.Add(new DataGridViewTextBoxColumn { Name = name, HeaderText = name, Width = width });

            return dgv;
        }

        private Label MakeLabel(string text, int y, bool bold = false)
        {
            return new Label
            {
                Text      = text,
                Left      = 10,
                Top       = y,
                AutoSize  = true,
                ForeColor = bold ? Color.White : Color.LightGray,
                Font      = bold ? new Font("Segoe UI Semibold", 10f) : new Font("Segoe UI", 9f),
            };
        }

        protected override void OnFormClosed(FormClosedEventArgs e)
        {
            _streamCts.Cancel();
            base.OnFormClosed(e);
        }
    }
}
