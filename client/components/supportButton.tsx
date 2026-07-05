"use client"

import { useRouter } from "next/navigation"

export default function SupportButton() {
  const router = useRouter()

  return (
    <div className="bg-gray-100 py-6 text-center">
      <button
        onClick={() => router.push("/support")}
        className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        Need Help? Contact Support
      </button>
    </div>
  )
}

// 'use client';
// import { useRouter } from 'next/navigation';

// export default function Layout({ children }) {
//   const router = useRouter();

//   const handleSupportClick = () => {
//     router.push('/support');
//   };

//   return (
//     <>
//       {children}
//       <div className="w-full flex justify-center py-6 bg-gray-100">
//         <button
//           onClick={handleSupportClick}
//           className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
//         >
//           Need Help? Submit a Query
//         </button>
//       </div>
//       <footer>{/* your existing footer code */}</footer>
//     </>
//   );
// }
