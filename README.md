# Mây — Thời tiết Việt Nam

Ứng dụng React theo dõi thời tiết hiện tại và dự báo 7 ngày cho 8 thành phố Việt Nam, dùng API miễn phí của Open‑Meteo.

## Chạy ứng dụng

Yêu cầu Node.js và npm.

```bash
npm install
npm run dev
```

Mở địa chỉ local mà Vite hiển thị trong terminal. Lệnh `npm run build` tạo bản production trong `dist/`.

## Tính năng

- Chọn và tìm kiếm thành phố, tìm kiếm không phân biệt dấu.
- Hiển thị nhiệt độ, cảm giác như, độ ẩm, gió, lượng mưa, bình minh và hoàng hôn.
- Dự báo 7 ngày gồm biểu tượng, nhiệt độ cao/thấp và xác suất mưa.
- Ảnh nền thẻ thời tiết chính thay đổi theo mã thời tiết; ảnh lấy từ Pexels và có liên kết ghi nguồn.
- Chuyển đổi °C/°F và lưu thành phố yêu thích trong localStorage.
- Trạng thái tải, lỗi có nút thử lại, giao diện responsive.

Không cần API key. Dữ liệu thời tiết được tải từ `https://api.open-meteo.com/v1/forecast`.
