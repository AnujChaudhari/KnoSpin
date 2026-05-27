"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs, addDoc, updateDoc, serverTimestamp, increment } from "firebase/firestore";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import ImageSlider from "@/components/ImageSlider";
import ReviewSection from "@/components/ReviewSection";
import RelatedProducts from "@/components/RelatedProducts";

// SVG Stickers for different digital product types
const DigitalStickers = {
  pdf: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  zip: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  course: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
      <line x1="8" y1="7" x2="16" y2="7" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  ),
  template: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="9" y1="21" x2="9" y2="9" />
    </svg>
  ),
  notes: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  ai_prompt: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  ebook: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 6h16M4 12h16M4 18h16" />
      <rect x="2" y="2" width="20" height="20" rx="2" />
    </svg>
  ),
  digital: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  download: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  infinity: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M13.833 8.875S15.085 7 18.043 7C21 7 23 9.5 23 12s-1.784 5-4.864 5c-3.914 0-5.969-3.5-9.136-3.5-3.167 0-5 2-5 2" />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  refresh: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
    </svg>
  ),
};

const DigitalBadge = () => (
  <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
    {DigitalStickers.digital}
    Digital Product
  </span>
);

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id;
  const [product, setProduct] = useState(null);
  const { addToCart } = useCart();
  const { user } = useAuth();

  // Digital download states
  const [hasPurchased, setHasPurchased] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadInfo, setDownloadInfo] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      const snap = await getDoc(doc(db, "products", productId));
      if (snap.exists()) {
        setProduct({ id: snap.id, ...snap.data() });
      } else {
        toast.error("Product not found");
      }
    };
    if (productId) fetchProduct();
  }, [productId]);

  // Check purchase status for digital products
  useEffect(() => {
    if (!user || !product?.isDigital) return;
    const checkPurchase = async () => {
      const ordersSnap = await getDocs(query(
        collection(db, "orders"),
        where("userId", "==", user.uid)
      ));
      const orders = ordersSnap.docs.map(d => d.data());
      const purchased = orders.some(o =>
        o.items?.some(item => item.productId === product.id) &&
        (o.status === "delivered" || o.status === "confirmed" || o.paymentStatus === "paid")
      );
      setHasPurchased(purchased);

      if (purchased) {
        const dlSnap = await getDocs(query(
          collection(db, "downloads"),
          where("userId", "==", user.uid),
          where("productId", "==", product.id)
        ));
        if (!dlSnap.empty) {
          setDownloadInfo({ id: dlSnap.docs[0].id, ...dlSnap.docs[0].data() });
        }
      }
    };
    checkPurchase();
  }, [user, product]);

  const handleDownload = async () => {
    if (!user) return toast.error("Please login to download");
    setIsDownloading(true);
    try {
      const dlSnap = await getDocs(query(
        collection(db, "downloads"),
        where("userId", "==", user.uid),
        where("productId", "==", product.id)
      ));

      if (dlSnap.empty) {
        const downloadToken = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
        await addDoc(collection(db, "downloads"), {
          userId: user.uid,
          productId: product.id,
          orderId: "purchase",
          downloadCount: 1,
          lastDownload: serverTimestamp(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          downloadToken,
        });
        setDownloadInfo({
          downloadCount: 1,
          lastDownload: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
      } else {
        const docRef = dlSnap.docs[0];
        const data = docRef.data();
        if (data.downloadCount >= (product.downloadLimit || 5)) {
          toast.error("Download limit reached");
          setIsDownloading(false);
          return;
        }
        await updateDoc(doc(db, "downloads", docRef.id), {
          downloadCount: increment(1),
          lastDownload: serverTimestamp(),
        });
        setDownloadInfo({
          ...data,
          downloadCount: data.downloadCount + 1,
          lastDownload: new Date(),
        });
      }

      window.open(product.digitalFileUrl, "_blank");
      toast.success("Download started!");
    } catch (err) {
      toast.error("Download failed. Please try again.");
    }
    setIsDownloading(false);
  };

  if (!product) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin text-primary-600">
          {DigitalStickers.refresh}
        </div>
      </div>
    );
  }

  const downloadLimit = product.downloadLimit || 5;
  const downloadsRemaining = downloadInfo ? downloadLimit - downloadInfo.downloadCount : downloadLimit;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="grid md:grid-cols-2 gap-6">
        <ImageSlider images={product.images} />
        <div className="space-y-4">
          {/* Digital Badge */}
          {product.isDigital && (
            <DigitalBadge />
          )}

          <h1 className="text-3xl font-bold">{product.name}</h1>

          {product.productCode && (
            <p className="text-sm text-gray-500 flex items-center gap-1">
              {DigitalStickers.shield}
              Code: {product.productCode}
            </p>
          )}

          <p className="text-2xl font-bold text-primary-600">₹{product.price}</p>

          {product.originalPrice && (
            <p className="text-lg line-through text-gray-400">
              ₹{product.originalPrice}
            </p>
          )}

          {/* Digital Product Info */}
          {product.isDigital && (
            <div className="bg-purple-50 dark:bg-purple-900/10 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-purple-700 dark:text-purple-300">
                {DigitalStickers[product.digitalCategory] || DigitalStickers.digital}
                {product.digitalCategory?.replace('_', ' ').toUpperCase() || "Digital Product"}
              </div>
              {product.digitalFileName && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  📄 {product.digitalFileName}
                </p>
              )}
              <div className="flex gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  {DigitalStickers.infinity}
                  {downloadLimit} downloads
                </span>
                <span className="flex items-center gap-1">
                  {DigitalStickers.shield}
                  Secure download
                </span>
              </div>
            </div>
          )}

          <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap break-words">
            {product.description}
          </p>

          {!product.isDigital && (
            <p className="flex items-center gap-1">
              <span className="text-gray-500">Stock:</span>
              <span className={product.stock > 0 ? "text-green-600 font-medium" : "text-red-600"}>
                {product.stock > 0 ? `${product.stock} available` : "Out of stock"}
              </span>
            </p>
          )}

          {/* Digital Download Section */}
          {product.isDigital && hasPurchased && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span className="font-medium">Purchased</span>
              </div>

              {downloadInfo && downloadInfo.downloadCount >= downloadLimit ? (
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-red-600 text-sm flex items-center gap-2">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                  Download limit reached ({downloadLimit}/{downloadLimit})
                </div>
              ) : (
                <>
                  <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="btn-gradient w-full flex items-center justify-center gap-2"
                  >
                    {isDownloading ? (
                      <>
                        <span className="animate-spin">{DigitalStickers.refresh}</span>
                        Preparing Download...
                      </>
                    ) : (
                      <>
                        {DigitalStickers.download}
                        Download Now
                      </>
                    )}
                  </button>
                  {downloadInfo && (
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Downloads: {downloadInfo.downloadCount}/{downloadLimit}</span>
                      <span>{downloadsRemaining} remaining</span>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Add to Cart Button (for physical or unpurchased digital) */}
          {(!product.isDigital || (product.isDigital && !hasPurchased)) && (
            <button
              onClick={() => {
                addToCart(product);
                toast.success("Added to cart!");
              }}
              className="btn-gradient w-full mt-4"
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>
      <ReviewSection productId={product.id} />
      <RelatedProducts category={product.category} currentProductId={product.id} />
    </div>
  );
}
