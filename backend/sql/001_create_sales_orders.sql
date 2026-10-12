/* Run this script in SSMS after selecting/creating the intended ERP database. */
IF OBJECT_ID('dbo.SalesOrders', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.SalesOrders (
    OrderId NVARCHAR(40) NOT NULL CONSTRAINT PK_SalesOrders PRIMARY KEY,
    VoucherNumber NVARCHAR(40) NOT NULL,
    VoucherType NVARCHAR(80) NOT NULL CONSTRAINT DF_SalesOrders_VoucherType DEFAULT ('Voucher Receipt'),
    RoutePlan NVARCHAR(150) NOT NULL CONSTRAINT DF_SalesOrders_RoutePlan DEFAULT (''),
    OrderDate DATE NOT NULL,
    Customer NVARCHAR(200) NOT NULL,
    Balance DECIMAL(18,2) NOT NULL CONSTRAINT DF_SalesOrders_Balance DEFAULT (0),
    Overdue DECIMAL(18,2) NOT NULL CONSTRAINT DF_SalesOrders_Overdue DEFAULT (0),
    LastPayment NVARCHAR(100) NULL,
    DeliveryDate DATE NULL,
    Notes NVARCHAR(MAX) NULL,
    Status NVARCHAR(30) NOT NULL CONSTRAINT DF_SalesOrders_Status DEFAULT ('Pending'),
    Authorized BIT NOT NULL CONSTRAINT DF_SalesOrders_Authorized DEFAULT (0),
    IsDraft BIT NOT NULL CONSTRAINT DF_SalesOrders_IsDraft DEFAULT (0),
    ItemsJson NVARCHAR(MAX) NOT NULL CONSTRAINT DF_SalesOrders_ItemsJson DEFAULT ('[]'),
    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_SalesOrders_CreatedAt DEFAULT (SYSUTCDATETIME()),
    UpdatedAt DATETIME2 NOT NULL CONSTRAINT DF_SalesOrders_UpdatedAt DEFAULT (SYSUTCDATETIME())
  );
  CREATE INDEX IX_SalesOrders_CreatedAt ON dbo.SalesOrders(CreatedAt DESC);
  CREATE INDEX IX_SalesOrders_Customer ON dbo.SalesOrders(Customer);
END;
GO
