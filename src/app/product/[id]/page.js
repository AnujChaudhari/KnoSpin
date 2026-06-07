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

/* ---------- Type Icons ---------- */
const EarthIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <ellipse cx="12" cy="12" rx="4" ry="10" />
    <path d="M2 12h20" />
  </svg>
);
const BagIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);

/* ---------- Digital stickers ---------- */
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
  coin: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  ),
};

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

  // Coin purchase states
  const [userProfile, setUserProfile] = useState(null);
  const [buyingWithCoins, setBuyingWithCoins] = useState(false);

  // ---------- Fetch product ----------
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

  // ---------- Fetch user profile (for coins) ----------
  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) setUserProfile(snap.data());
    };
    fetchProfile();
  }, [user]);

  // ---------- Check purchase status for digital products ----------
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

  // ---------- Regular download handler ----------
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

  // ---------- Buy with coins handler ----------
  const handleBuyWithCoins = async () => {
    if (!user) {
      toast.error("Please login first");
      return;
    }
    if (!userProfile || (userProfile.coins || 0) < product.coinPrice) {
      toast.error("Insufficient coins. Earn more by spinning or referring friends!");
      return;
    }
    setBuyingWithCoins(true);
    try {
      const res = await fetch("/api/coins/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.uid,
        },
        body: JSON.stringify({ productId: product.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Purchase failed");
        setBuyingWithCoins(false);
        return;
      }

      // Update local coin balance
      setUserProfile(prev => ({ ...prev, coins: (prev.coins || 0) - product.coinPrice }));

      // Mark as purchased so download button shows
      setHasPurchased(true);
      toast.success("Purchase successful! You can now download the file.");
    } catch (err) {
      toast.error("Network error, please try again.");
    }
    setBuyingWithCoins(false);
  };

  // ---------- Early return if product not loaded ----------
  if (!product) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin text-primary-600">Loading...</div>
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
          {/* Type indicator next to product name */}
          <div className="flex items-center gap-2">
            {product.isDigital ? (
              <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 p-1 rounded-full" title="Digital Product">
                <EarthIcon />
              </span>
            ) : (
              <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 p-1 rounded-full" title="Physical Product">
                <BagIcon />
              </span>
            )}
            <h1 className="text-3xl font-bold">{product.name}</h1>
          </div>

          {product.productCode && (
            <p className="text-sm text-gray-500 flex items-center gap-1">
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
                <span>{downloadLimit} downloads</span>
                <span>Secure download</span>
              </div>
              {/* Coin price display */}
              {product.coinPrice > 0 && (
                <div className="flex items-center gap-1 text-sm font-medium text-yellow-700 dark:text-yellow-400">
                  {DigitalStickers.coin}
                  <span>{product.coinPrice} coins</span>
                </div>
              )}
            </div>
          )}

          {/* Warning for digital product */}
          {product.isDigital && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3 rounded-xl text-xs text-yellow-700 dark:text-yellow-400">
              ⚠️ This is a digital product. Download link works only once. For any issue, DM <strong>@QuickShopPro</strong> on Telegram. Free services may have upload limits – we appreciate your patience.
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
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-red-600 text-sm">
                  Download limit reached ({downloadLimit}/{downloadLimit}). Contact @QuickShopPro if needed.
                </div>
              ) : (
                <>
                  <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="btn-gradient w-full flex items-center justify-center gap-2"
                  >
                    {isDownloading ? "Preparing..." : (
                      <>
                        {DigitalStickers.download} Download Now
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

          {/* Buy with Coins Button */}
          {product.isDigital && product.coinPrice > 0 && !hasPurchased && (
            <div className="mt-4">
              <button
                onClick={handleBuyWithCoins}
                disabled={buyingWithCoins}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg w-full flex items-center justify-center gap-2"
              >
                {buyingWithCoins ? (
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <>
                    {DigitalStickers.coin} Buy with {product.coinPrice} Coins
                  </>
                )}
              </button>
              {userProfile && (
                <p className="text-xs text-gray-500 mt-1 text-center">
                  Your balance: {userProfile.coins || 0} coins
                </p>
              )}
            </div>
          )}

          {/* Add to Cart Button */}
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
