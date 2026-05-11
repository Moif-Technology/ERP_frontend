# Product Entry — UI Field to Database Column Map

Shows exactly what each UI field in ProductEntry.jsx does and which DB column it ends up in.

---

## GENERAL TAB → `core.product_master`

| UI Label          | Saved? | DB Column            | Notes |
|-------------------|--------|----------------------|-------|
| Product Code      | ✅ Yes | `product_code`       | Required. Auto-generated from name if software is RESTAURANT/POS |
| Barcode           | ✅ Yes | `barcode`            | If "Auto Gen" toggled ON → saved as barcode_type='NEW', barcode=null |
| Own Ref No.       | ✅ Yes | `own_ref_no`         | Numeric only (NUMERIC 18,0) |
| Product Name      | ✅ Yes | `product_name`       | Required |
| Short Description | ✅ Yes | `short_name`         | |
| Arabic Description| ✅ Yes | `description_arabic` | |
| Make Type         | ✅ Yes | `make_type`          | Standard / Assembly / Service |
| Group             | ✅ Yes | `group_id`           | Foreign key — select from dropdown |
| Subgroup          | ✅ Yes | `subgroup_id`        | Foreign key — select from dropdown |
| Sub-subgroup ID   | ✅ Yes | `subsubgroup_id`     | Must be a numeric ID |
| Brand             | ✅ Yes | `brand_name`         | Free text → saved to brand_name column. If you type a numeric ID it also sets brand_id |
| Last Supplier     | ⚠️ Partial | `last_supplier_id` | Only sets the ID if you type a number. No name column for supplier yet |
| Specification     | ✅ Yes | `specification`      | Max 250 characters |

---

## PRICING & VAT TAB → `core.product_inventory`

### How "Average Cost" is resolved before saving

The frontend picks the first non-empty value from this priority list:

```
1. Cost With VAT  →  back-calculates net:  gross ÷ (1 + VAT In % ÷ 100)
2. Unit Cost      →  used directly
3. Average Cost   →  used directly
4. Base Cost      →  used as last resort
         ↓
   Saved as → average_cost column
```

### How "Unit Price" is resolved before saving

```
1. Price With VAT  →  back-calculates net:  gross ÷ (1 + VAT Out % ÷ 100)
2. Unit Price      →  used directly
         ↓
   Saved as → unit_price  AND  maximum_retail_price  (same value, both columns)
```

### How "Last Purchase Cost" is resolved before saving

```
1. Last Purchase Cost field
2. resolved Average Cost  (from chain above)
3. Unit Cost
4. Base Cost
         ↓
   Saved as → last_purchase_cost column
```

### Full Pricing Field Table

| UI Label            | Saved? | DB Column (product_inventory)    | Notes |
|---------------------|--------|----------------------------------|-------|
| **Base Cost**       | ⚠️ Fallback only | `average_cost` / `last_purchase_cost` | NOT its own column. Only used if Average Cost AND Unit Cost are both empty |
| **Unit Cost**       | ⚠️ Fallback only | `average_cost`                   | NOT its own column. 2nd priority in the cost chain above |
| **Average Cost**    | ✅ Yes | `average_cost`                   | 3rd priority — used directly if Unit Cost is empty |
| **Cost With VAT**   | ❌ Not saved | *(none)*                    | Helper field only. Back-calculates net cost: gross ÷ (1 + VAT In%). Result feeds into average_cost as 1st priority |
| **Last Purchase Cost** | ✅ Yes | `last_purchase_cost`          | |
| **Margin %**        | ✅ Yes | `minimum_margin_percentage`      | |
| **Discount %**      | ✅ Yes | `discount_percentage`            | |
| **VAT In Amt**      | ✅ Yes | `input_tax_1_amount`             | |
| **VAT In %**        | ✅ Yes | `input_tax_1_rate`               | Also used by "Cost With VAT" to back-calculate |
| **VAT Out Amt**     | ✅ Yes | `output_tax_1_amount`            | |
| **VAT Out %**       | ✅ Yes | `output_tax_1_rate`              | Also used by "Price With VAT" to back-calculate |
| **Price With VAT**  | ❌ Not saved | *(none)*                   | Helper field only. Back-calculates net price: gross ÷ (1 + VAT Out%). Result feeds into unit_price as 1st priority |
| **Min Unit Price**  | ✅ Yes | `minimum_retail_price`           | |
| **Unit Price**      | ✅ Yes | `unit_price` + `maximum_retail_price` | Sets both columns to the same value |
| **Price Level 1**   | ✅ Yes | `price_level_1`                  | Falls back to Unit Price if empty |

---

## STOCK & SUPPLIER TAB

| UI Label           | Saved? | DB Column               | Table               |
|--------------------|--------|-------------------------|---------------------|
| Supplier           | ⚠️ Partial | `last_supplier_id`  | product_master — only if you type a numeric ID |
| Supplier Ref No    | ✅ Yes | `supplier_ref_no`       | product_master      |
| Unit               | ✅ Yes | `unit_name`             | product_master      |
| Product Type       | ✅ Yes | `product_type`          | product_master      |
| Pack Qty           | ✅ Yes | `pack_qty`              | both tables         |
| Stock Type         | ✅ Yes | `stock_type`            | product_master      |
| Packet Details     | ✅ Yes | `pack_description`      | product_master      |
| Location           | ✅ Yes | `location_code`         | product_inventory   |
| Origin             | ✅ Yes | `country_of_origin`     | product_master      |
| Reorder Level      | ✅ Yes | `reorder_level`         | product_inventory   |
| Reorder Qty        | ✅ Yes | `reorder_qty`           | product_inventory   |
| Qty On Hand        | ✅ Yes | `qty_on_hand`           | product_inventory   |
| Product Identity   | ✅ Yes | `product_identity`      | product_master — Yes=1, No=0 |
| Remark             | ✅ Yes | `remarks`               | product_master      |

---

## TRADING TAB

| UI Section         | Saved? | Notes |
|--------------------|--------|-------|
| Product Lines      | ❌ No  | UI only — not connected to any API or DB table yet |
| Substitute Products| ❌ No  | UI only — not connected to any API or DB table yet |

---

## ACTION BUTTONS

| Button    | Works? | Notes |
|-----------|--------|-------|
| Save/Update | ✅ Yes | Full save to product_master + product_inventory |
| Cancel    | ❌ No  | Placeholder — no action wired |
| Post      | ❌ No  | Placeholder — no action wired |
| Unpost    | ❌ No  | Placeholder — no action wired |
| Print     | ❌ No  | Placeholder — no action wired |

---

## PRODUCT IMAGES

| Feature       | Works? | Notes |
|---------------|--------|-------|
| Image upload  | ❌ No  | UI only — images are previewed locally but not sent to the API. The DB column `image_url` exists and is ready |

---

## QUICK REFERENCE — Cost/Price Flow Diagram

```
UI FIELD             →  RESOLVED AS        →  DB COLUMN
─────────────────────────────────────────────────────────────────
Cost With VAT        →  net = gross/(1+r)  ─┐
Unit Cost            →  direct             ─┤→ average_cost
Average Cost         →  direct             ─┤   (first non-empty wins)
Base Cost            →  direct (fallback)  ─┘

Price With VAT       →  net = gross/(1+r)  ─┐
Unit Price           →  direct             ─┘→ unit_price
                                              maximum_retail_price (same value)

Price Level 1        →  direct (or Unit Price if empty) → price_level_1

Last Purchase Cost   →  direct             ─┐
  (fallback: avg cost → unit cost → base)  ─┘→ last_purchase_cost

Min Unit Price       →  direct             →  minimum_retail_price
Margin %             →  direct             →  minimum_margin_percentage
Discount %           →  direct             →  discount_percentage
VAT In Amt           →  direct             →  input_tax_1_amount
VAT In %             →  direct             →  input_tax_1_rate
VAT Out Amt          →  direct             →  output_tax_1_amount
VAT Out %            →  direct             →  output_tax_1_rate
```
