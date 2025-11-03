import React, { useState, useRef, useEffect } from "react";
import { Facebook, Instagram, Youtube, Linkedin, Loader2 } from "lucide-react";

const FB_PAGE_URL = "https://www.facebook.com/rayfogbusinesssolutions/";
const IG_POST_URL = "https://www.instagram.com/rayfogbusinesssolutions/?hl=en"; // Replace with a *public* post
// const YT_VIDEO_URL = "www.youtube.com/@RayFogBusinesssolution";
const YT_VIDEO_URL = "https://www.youtube.com/shorts/wpKHS9QiPhc";

const LINKEDIN_PAGE_URL = "https://www.linkedin.com/company/rayfogbusinesssolutions/";

const SocialMedia = () => {
  const [activeTab, setActiveTab] = useState("facebook");
  const [loading, setLoading] = useState(true);
  const [embedSize, setEmbedSize] = useState({ width: 800, height: 600 });
  const containerRef = useRef(null);

  const tabs = [
    { id: "facebook", label: "Facebook", icon: <Facebook className="w-5 h-5 text-blue-600" /> },
    { id: "instagram", label: "Instagram", icon: <Instagram className="w-5 h-5 text-pink-500" /> },
    { id: "youtube", label: "YouTube", icon: <Youtube className="w-5 h-5 text-red-600" /> },
    // { id: "linkedin", label: "LinkedIn", icon: <Linkedin className="w-5 h-5 text-blue-700" /> },
  ];

  // Facebook Page Plugin URL
  const fbEmbedUrl = (pageUrl, w, h) => {
    const href = encodeURIComponent(pageUrl);
    return `https://www.facebook.com/plugins/page.php?href=${href}&tabs=timeline&width=${w}&height=${h}&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true`;
  };

  // Convert YouTube URLs (watch, short, youtu.be) to embeddable format
  const getYoutubeEmbed = (url) => {
    if (!url) return null;
    try {
      const fixed = url.replace(/^hhttps?:\/\//, "https://");
      const u = new URL(fixed);
      let id = "";

      if (u.hostname.includes("youtu.be")) id = u.pathname.split("/")[1];
      else if (u.searchParams.get("v")) id = u.searchParams.get("v");
      else if (u.pathname.includes("/shorts/")) id = u.pathname.split("/shorts/")[1];
      else if (u.pathname.includes("/embed/")) id = u.pathname.split("/embed/")[1];

      return id ? `https://www.youtube.com/embed/${id}?rel=0` : null;
    } catch {
      return null;
    }
  };

  // Auto-resize embeds based on container
  useEffect(() => {
    const resize = () => {
      const width = Math.min(containerRef.current?.offsetWidth || window.innerWidth - 200, 1000);
      const height = Math.min(window.innerHeight - 200, 700);
      setEmbedSize({ width, height });
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // Reload state on tab switch
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, [activeTab]);

  // Instagram embed script handling
  useEffect(() => {
    if (activeTab !== "instagram") return;
    const processInstagram = () => {
      if (window.instgrm && window.instgrm.Embeds) {
        window.instgrm.Embeds.process();
      }
    };

    if (!document.querySelector('script[src="https://www.instagram.com/embed.js"]')) {
      const script = document.createElement("script");
      script.src = "https://www.instagram.com/embed.js";
      script.async = true;
      script.onload = processInstagram;
      document.body.appendChild(script);
    } else {
      // Already loaded, just process the new embed
      processInstagram();
    }
  }, [activeTab]);

  const ytEmbed = getYoutubeEmbed(YT_VIDEO_URL);

  return (
    <div ref={containerRef} className="w-full">
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
        {/* Tabs */}
        <div className="flex flex-wrap gap-3 mb-6 border-b pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow"
                  : "bg-gray-50 text-gray-600 hover:text-gray-800"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
    <div className="space-y-4 w-full">
          {/* FACEBOOK */}
          {activeTab === "facebook" && (
            <div className="space-y-4" >
              <h3 className="text-xl font-semibold text-blue-700 flex items-center gap-2">
                <Facebook className="w-5 h-5" /> Facebook Page
              </h3>
              <div className="mt-3 rounded-lg overflow-hidden border bg-white ">
                <iframe
                  title="Facebook Page"
                  src={fbEmbedUrl(FB_PAGE_URL, embedSize.width, embedSize.height)}
                  loading="lazy"
                  className="w-full"
                  style={{ height: embedSize.height, border: 0 }}
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                />
              </div>
            </div>
          )}

          {/* INSTAGRAM */}
          {activeTab === "instagram" && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-pink-600 flex items-center gap-2">
                <Instagram className="w-5 h-5" /> Instagram Post
              </h3>
              <p className="text-gray-600 text-sm">
                Displays your public Instagram post. The post must be visible to everyone.
              </p>
              {loading && (
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading Instagram post…
                </div>
              )}
              <div className="mt-3 rounded-lg overflow-hidden border bg-white p-3">
                <blockquote
                  className="instagram-media"
                  data-instgrm-permalink={IG_POST_URL}
                  data-instgrm-version="14"
                  style={{ width: "100%", margin: 0 }}
                />
              </div>
            </div>
          )}

          {/* YOUTUBE */}
          {activeTab === "youtube" && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-red-600 flex items-center gap-2">
                <Youtube className="w-5 h-5" /> YouTube Video
              </h3>
              <p className="text-gray-600 text-sm">Plays an embeddable YouTube video.</p>
              {loading && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading YouTube video…
                </div>
              )}
              <div className="mt-3 rounded-lg overflow-hidden border bg-white">
                {ytEmbed ? (
                  <iframe
                    title="YouTube Video"
                    src={ytEmbed}
                    loading="lazy"
                    className="w-full"
                    style={{ height: Math.max(360, embedSize.height), border: 0 }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <div className="p-6 text-sm text-gray-600">
                    Could not generate embed from: <code>{YT_VIDEO_URL}</code>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* LINKEDIN */}
          {activeTab === "linkedin" && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-blue-700 flex items-center gap-2">
                <Linkedin className="w-5 h-5" /> LinkedIn
              </h3>
              <p className="text-gray-600 text-sm">
                LinkedIn pages cannot be directly embedded — open in a new tab:
              </p>
              <a
                href={LINKEDIN_PAGE_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Visit LinkedIn
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SocialMedia;
