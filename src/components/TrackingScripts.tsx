import { useEffect } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const TrackingScripts = () => {
  const { data: settings } = useSiteSettings();

  // Capture fbclid from URL on page load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fbclid = params.get("fbclid");
    if (fbclid) {
      sessionStorage.setItem("fbclid", fbclid);
      // Build fbc cookie format: fb.1.timestamp.fbclid
      const fbc = `fb.1.${Date.now()}.${fbclid}`;
      sessionStorage.setItem("fbc", fbc);
    }
    // Capture _fbp cookie if present
    const fbpCookie = document.cookie.split(";").find((c) => c.trim().startsWith("_fbp="));
    if (fbpCookie) {
      sessionStorage.setItem("fbp", fbpCookie.split("=")[1]);
    }
  }, []);

  useEffect(() => {
    if (!settings) return;

    // Facebook Pixel with Advanced Matching
    if (settings.facebook_pixel_id) {
      const script = document.createElement("script");
      // Build advanced matching data from sessionStorage
      const advancedMatching: Record<string, string> = {};
      const em = sessionStorage.getItem("fb_em");
      const fn = sessionStorage.getItem("fb_fn");
      const ln = sessionStorage.getItem("fb_ln");
      const ph = sessionStorage.getItem("fb_ph");
      if (em) advancedMatching.em = em.toLowerCase().trim();
      if (fn) advancedMatching.fn = fn.toLowerCase().trim();
      if (ln) advancedMatching.ln = ln.toLowerCase().trim();
      if (ph) advancedMatching.ph = ph.replace(/[^0-9]/g, "");

      const matchingJson = JSON.stringify(advancedMatching);
      script.innerHTML = `
        !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
        n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
        (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
        fbq('init','${settings.facebook_pixel_id}',${matchingJson});fbq('track','PageView');
      `;
      script.id = "fb-pixel";
      if (!document.getElementById("fb-pixel")) document.head.appendChild(script);
    }

    // TikTok Pixel
    if (settings.tiktok_pixel_id) {
      const script = document.createElement("script");
      script.innerHTML = `
        !function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
        ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];
        ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
        for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
        ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
        ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";
        ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e]=+new Date;
        ttq._o=ttq._o||{};ttq._o[e]=n||{};
        var o=document.createElement("script");o.type="text/javascript";o.async=!0;o.src=i+"?sdkid="+e+"&lib="+t;
        var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
        ttq.load('${settings.tiktok_pixel_id}');ttq.page();
        }(window,document,'ttq');
      `;
      script.id = "tt-pixel";
      if (!document.getElementById("tt-pixel")) document.head.appendChild(script);
    }

    // Google Analytics
    if (settings.google_analytics_id) {
      const gtagScript = document.createElement("script");
      gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${settings.google_analytics_id}`;
      gtagScript.async = true;
      gtagScript.id = "ga-script";
      if (!document.getElementById("ga-script")) {
        document.head.appendChild(gtagScript);
        const inlineScript = document.createElement("script");
        inlineScript.innerHTML = `
          window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
          gtag('js',new Date());gtag('config','${settings.google_analytics_id}');
        `;
        document.head.appendChild(inlineScript);
      }
    }

    // Google Tag Manager
    if (settings.google_tag_manager_id) {
      const script = document.createElement("script");
      script.innerHTML = `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
        var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
        j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
        f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${settings.google_tag_manager_id}');
      `;
      script.id = "gtm-script";
      if (!document.getElementById("gtm-script")) document.head.appendChild(script);
    }
  }, [settings]);

  return null;
};

export default TrackingScripts;
