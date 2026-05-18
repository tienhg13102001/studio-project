// import { Calendar, ChevronLeft, ChevronRight, Clock, Eye, Film, MapPin, PlayCircle, User, Video } from "lucide-react";
// import { useState, type CSSProperties, type FC } from "react";

// // Dữ liệu mẫu mô phỏng theo video
// const MOCK_DATA = {
//   title: "Đông Stress - Mờ Strong",
//   category: "Healthcare",
//   client: "T-Matsuoka Medical Center",
//   year: "2024",
//   duration: "60s",
//   about:
//     'A compelling TVC showcasing how T-Matsuoka Medical Center helps people from all walks of life manage stress and regain their strength. The message "Close Stress, Open Strong" is a gentle reminder: When you\'re tired, just come to us.',
//   crew: [
//     { role: "Director", name: "Phạm Trần Minh Tuấn", icon: <Film size={16} /> },
//     { role: "Cinematographer", name: "tiemnguyen", icon: <Video size={16} /> },
//     { role: "Producer", name: "Lan Anh Nguyen", icon: <User size={16} /> },
//   ],
//   images: [
//     { id: 1, url: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=2070&auto=format&fit=crop", caption: "Behind The Scenes 1" },
//     { id: 2, url: "https://images.unsplash.com/photo-1494548162494-384bba4ab999?q=80&w=2070&auto=format&fit=crop", caption: "Behind The Scenes 2" },
//     { id: 3, url: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?q=80&w=2070&auto=format&fit=crop", caption: "Behind The Scenes 3" },
//     { id: 4, url: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?q=80&w=2070&auto=format&fit=crop", caption: "Behind The Scenes 4" },
//     { id: 5, url: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=2070&auto=format&fit=crop", caption: "Behind The Scenes 5" },
//   ],
// };

// type Props = {};

// const ProjectDetail: FC<Props> = () => {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const totalImages = MOCK_DATA.images.length;

//   const handleNext = () => {
//     if (currentIndex < totalImages - 1) {
//       setCurrentIndex((prev) => prev + 1);
//     }
//   };

//   const handlePrev = () => {
//     if (currentIndex > 0) {
//       setCurrentIndex((prev) => prev - 1);
//     }
//   };

//   // Hàm tính toán CSS linh hoạt cho từng thẻ ảnh dựa trên vị trí của nó so với ảnh hiện tại
//   const getCardStyle = (index: number): CSSProperties => {
//     const offset = index - currentIndex;

//     if (offset === 0) {
//       // Thẻ đang hiển thị chính (Active)
//       return {
//         transform: "translateY(0px) scale(1) rotate(0deg)",
//         transformOrigin: "bottom center",
//         zIndex: 20,
//         opacity: 1,
//       };
//     } else if (offset > 0 && offset <= 3) {
//       // Các thẻ phía sau — hiệu ứng xoè bài
//       const rotation = offset * 7; // 7°, 14°, 21°
//       const translateY = offset * 10; // dịch xuống 10px, 20px, 30px
//       const scale = 1 - offset * 0.03; // thu nhỏ nhẹ theo khoảng cách
//       const zIndex = 20 - offset * 5; // z-index giảm dần
//       return {
//         transform: `translateY(${translateY}px) scale(${scale}) rotate(${rotation}deg)`,
//         transformOrigin: "bottom center",
//         zIndex,
//         opacity: 1,
//         pointerEvents: "none" as const,
//       };
//     } else if (offset > 3) {
//       // Các thẻ quá xa — ẩn đi, giữ vị trí cuối của nhóm xoè
//       return {
//         transform: "translateY(30px) scale(0.91) rotate(28deg)",
//         transformOrigin: "bottom center",
//         zIndex: 0,
//         opacity: 0,
//         pointerEvents: "none" as const,
//       };
//     } else {
//       // Các thẻ đã qua — trượt sang trái và biến mất
//       return {
//         transform: "translateX(-110%) scale(0.95) rotate(-5deg)",
//         transformOrigin: "bottom center",
//         zIndex: 30,
//         opacity: 0,
//         pointerEvents: "none" as const,
//       };
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center font-sans overflow-hidden">
//       {/* Container chính */}
//       <div className="w-full max-w-7xl px-8 flex flex-col lg:flex-row gap-12 lg:gap-24 relative pb-48">
//         {/* CỘT TRÁI: THÔNG TIN (Info Column) */}
//         <div className="w-full lg:w-2/5 flex flex-col justify-center space-y-8 z-30">
//           {/* Header Info */}
//           <div>
//             <span className="inline-block px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded-md text-sm font-medium mb-4">{MOCK_DATA.category}</span>
//             <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
//               <span className="bg-white/10 p-2 rounded-lg">
//                 <Film size={24} className="text-white" />
//               </span>
//               {MOCK_DATA.title}
//             </h1>

//             <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400">
//               <div className="flex items-center gap-2">
//                 <MapPin size={16} /> {MOCK_DATA.client}
//               </div>
//               <div className="flex items-center gap-2">
//                 <Calendar size={16} /> {MOCK_DATA.year}
//               </div>
//               <div className="flex items-center gap-2">
//                 <Clock size={16} /> {MOCK_DATA.duration}
//               </div>
//             </div>
//           </div>

//           {/* About */}
//           <div>
//             <h3 className="text-sm font-semibold tracking-wider text-gray-400 mb-2 uppercase">About</h3>
//             <p className="text-gray-300 leading-relaxed text-sm">{MOCK_DATA.about}</p>
//           </div>

//           {/* Production Team */}
//           <div>
//             <h3 className="text-sm font-semibold tracking-wider text-gray-400 mb-4 uppercase">Production Team</h3>
//             <div className="space-y-3 text-sm">
//               {MOCK_DATA.crew.map((member, idx) => (
//                 <div key={idx} className="flex justify-between items-center border-b border-gray-800 pb-2">
//                   <div className="flex items-center gap-3 text-gray-400">
//                     {member.icon}
//                     <span>{member.role}</span>
//                   </div>
//                   <span className="text-gray-200">{member.name}</span>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Action Button */}
//           <button className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
//             Watch More <PlayCircle size={20} />
//           </button>
//         </div>

//         {/* CỘT PHẢI: SLIDER HÌNH ẢNH (Slider Column) */}
//         <div className="w-full lg:w-3/5 h-100 lg:h-150 relative flex items-center">
//           {/* Khu vực chứa các thẻ ảnh (Perspective để tạo chiều sâu nếu cần, ở đây dùng 2D transform cho đơn giản và mượt) */}
//           <div className="relative w-full h-full md:h-[80%] flex items-center justify-center">
//             {MOCK_DATA.images.map((image, index) => {
//               const overlayOpacity = Math.min(Math.max(index - currentIndex, 0) * 0.3, 0.85);
//               return (
//                 <div
//                   key={image.id}
//                   className="absolute top-0 left-0 w-full md:w-[85%] h-full rounded-2xl overflow-hidden shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] origin-center bg-gray-900"
//                   style={getCardStyle(index)}
//                 >
//                   {/* Hình nền */}
//                   <img src={image.url} alt={image.caption} className="w-full h-full object-cover" />

//                   {/* Lớp phủ gradient để dễ đọc text */}
//                   <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-black/20"></div>

//                   {/* Lớp phủ đen — tối dần theo khoảng cách */}
//                   <div className="absolute inset-0 bg-black transition-all duration-700" style={{ opacity: overlayOpacity }}></div>

//                   {/* Số thứ tự góc trên phải */}
//                   <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium tracking-widest">
//                     {index + 1} / {totalImages}
//                   </div>

//                   {/* Tiêu đề & Icon ở góc dưới */}
//                   <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
//                     <h2 className="text-xl md:text-2xl font-semibold text-white shadow-sm">{image.caption}</h2>
//                     <button className="p-3 bg-black/40 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors">
//                       <Eye size={20} className="text-white" />
//                     </button>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>

//           {/* Điều hướng (Navigation Controls) - Căn giữa ở dưới cùng */}
//           <div className="absolute -bottom-20  md:-bottom-10 left-0 w-full flex flex-col items-center gap-4 z-40">
//             {/* Nút bấm */}
//             <div className="flex items-center gap-6">
//               <button
//                 onClick={handlePrev}
//                 disabled={currentIndex === 0}
//                 className={`p-3 rounded-full flex items-center justify-center transition-all ${
//                   currentIndex === 0 ? "bg-gray-800/50 text-gray-600 cursor-not-allowed" : "bg-white/10 hover:bg-white/20 text-white backdrop-blur-md"
//                 }`}
//               >
//                 <ChevronLeft size={24} />
//               </button>

//               <span className="text-gray-400 text-sm tracking-widest uppercase">Click arrows</span>

//               <button
//                 onClick={handleNext}
//                 disabled={currentIndex === totalImages - 1}
//                 className={`p-3 rounded-full flex items-center justify-center transition-all ${
//                   currentIndex === totalImages - 1
//                     ? "bg-gray-800/50 text-gray-600 cursor-not-allowed"
//                     : "bg-white/10 hover:bg-white/20 text-white backdrop-blur-md"
//                 }`}
//               >
//                 <ChevronRight size={24} />
//               </button>
//             </div>

//             {/* Dấu chấm chỉ báo (Dots indicator) */}
//             <div className="flex items-center gap-2">
//               {MOCK_DATA.images.map((_, idx) => (
//                 <div
//                   key={idx}
//                   className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? "w-6 bg-white" : "w-1.5 bg-gray-600"}`}
//                 />
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProjectDetail;
