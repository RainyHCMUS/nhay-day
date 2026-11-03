# Nhảy Dây cùng Bee — hướng dẫn

App web chạy offline trên iPhone. Mỗi ngày thêm 1 clip nhảy dây = 1 ⭐, ngày nào cũng có sao thì chuỗi tăng.
Dữ liệu (sao, chuỗi, ảnh thu nhỏ, bản sao clip nếu bật) nằm trong app trên **từng iPhone**, không gửi đi đâu.

## Thư mục

| Tệp | Vai trò |
|---|---|
| `index.html`, `styles.css`, `app.js` | Giao diện + logic (đếm chuỗi, lịch, huy hiệu, sao lưu) |
| `mascot.js` | Chú ong Bee (SVG, 4 tâm trạng: happy / wink / party / sad). Mỗi ngày một bộ đồ + ánh mắt + màu do `mascotLookFor(ngày)` chọn; thêm bộ mới thì thêm vào `OUTFITS`/`EYES` và vẽ trong `outfitLayers`/`EYE` |
| `sw.js` | Cho app chạy không cần mạng |
| `manifest.webmanifest`, `icons/` | Tên + icon khi thêm vào màn hình chính |
| `tools/` | Tạo lại icon: `sh tools/make-icons.sh` (không cần đưa lên mạng) |

## 1. App đang ở đâu trên mạng

- **Link cài app:** https://rainyhcmus.github.io/nhay-day/
- **Kho mã (công khai):** https://github.com/RainyHCMUS/nhay-day (GitHub Pages, nhánh `main`, thư mục gốc; đưa lên ngày 03/11/2026)

iPhone chỉ cho app chạy offline khi trang được mở qua **HTTPS**, nên app nằm trên GitHub Pages thay vì Mac mini.
Trên mạng chỉ có mã app, không có dữ liệu hay video của ai.

## 2. Cài lên iPhone

1. Mở link bằng **Safari**.
2. Bấm **Chia sẻ** (iOS 26: bấm **•••** → Chia sẻ) → **Thêm vào MH chính** → **Thêm**.
3. Mở app bằng icon, nhập tên. Lần đầu mở nên có mạng; sau đó dùng offline được.
4. Luôn mở bằng icon. Mở bằng link trong Safari sẽ ra một bản **trống**, khác dữ liệu.

Người khác muốn dùng: gửi link, họ làm y như trên, mỗi người có dữ liệu riêng.

## 3. Luật tính sao

- Ngày có ít nhất 1 clip = 1 ⭐ (thêm nhiều clip vẫn 1 sao).
- Thêm được cho **hôm nay** hoặc **hôm qua** (quên thì bù được 1 ngày).
- Chuỗi = số ngày có sao liên tiếp tính đến hôm nay (hoặc hôm qua nếu hôm nay chưa nhảy).
- Huy hiệu ở các mốc 3, 7, 14, 21, 30, 50, 66, 100, 200, 365 ngày; đã đạt thì giữ mãi.

## 4. Sao lưu — QUAN TRỌNG

Xoá icon app = mất dữ liệu. Vào ⚙️ **Cài đặt → Sao lưu ngay** → lưu file vào app **Tệp**.
Đổi máy: cài app trên máy mới → ⚙️ → **Khôi phục từ file sao lưu**. File sao lưu không kèm video.

## 5. Phát hành bản mới

1. Sửa mã, tăng `APP_VERSION` trong `app.js`, đổi `CACHE` trong `sw.js` cho trùng phiên bản, ghi `CHANGELOG.md`.
2. Đẩy lên GitHub (trong thư mục `nhay-day`): `git add -A && git commit -m "vX.Y.Z ..." && git -c credential.helper='!gh auth git-credential' push` (máy chưa cấu hình mật khẩu git nên mượn đăng nhập của `gh`). Khoảng 1 phút sau GitHub Pages tự cập nhật.
3. iPhone tự lấy bản mới ở lần mở app có mạng kế tiếp (có khi phải mở lại app lần 2); dữ liệu giữ nguyên.

Nếu quên đổi `CACHE` trong `sw.js`, iPhone sẽ **không** nhận bản mới.

## Chạy thử trên Mac

```bash
python3 -m http.server 3960 --bind 127.0.0.1 --directory "/Users/nnc/NNC Agent/nhay-day"
```
Mở http://localhost:3960 (localhost được coi là an toàn nên chạy offline được như thật).
