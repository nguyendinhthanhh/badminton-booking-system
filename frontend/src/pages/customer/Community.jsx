import React from 'react';
import { Users, MessageSquare, Heart } from 'lucide-react';

const Community = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    Cộng đồng Cầu lông
                </h1>
                <p className="text-lg text-gray-600">
                    Kết nối, chia sẻ và giao lưu cùng những người đam mê cầu lông.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {/* Feature 1 */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-4">
                        <Users className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Tìm bạn chơi</h3>
                    <p className="text-gray-500">
                        Tìm kiếm người chơi cùng trình độ, ghép cặp đôi nam nữ dễ dàng.
                    </p>
                </div>

                {/* Feature 2 */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mx-auto mb-4">
                        <MessageSquare className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Thảo luận</h3>
                    <p className="text-gray-500">
                        Chia sẻ kinh nghiệm, kỹ thuật và thảo luận về các giải đấu.
                    </p>
                </div>

                {/* Feature 3 */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 mx-auto mb-4">
                        <Heart className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">CLB Yêu thích</h3>
                    <p className="text-gray-500">
                        Tham gia các câu lạc bộ, tổ chức giải đấu nội bộ.
                    </p>
                </div>
            </div>

            <div className="mt-16 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-gray-500 text-sm font-medium">
                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                    Tính năng đang được phát triển
                </div>
            </div>
        </div>
    );
};

export default Community;
