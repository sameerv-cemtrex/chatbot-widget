(() => {
  const script = document.currentScript;

  const loadWidget = () => {
    const widget = document.createElement("div");
    const floatBtn = document.createElement("div");

    const floatBtnStyle = floatBtn.style;
    floatBtnStyle.position = "fixed";
    floatBtnStyle.bottom = "20px";
    floatBtnStyle.right = "20px";
    floatBtnStyle.zIndex = 123654;
    floatBtnStyle.width = "40px";
    floatBtnStyle.height = "40px";
    floatBtnStyle.borderRadius = "25px";
    floatBtnStyle.background = "#0f0";
    floatBtnStyle.display = "grid";
    floatBtnStyle.placeItems = "center";
    floatBtnStyle.cursor = "pointer";

    const widgetStyle = widget.style;
    widgetStyle.display = "none";
    widgetStyle.boxSizing = "border-box";
    widgetStyle.width = "350px";
    widgetStyle.height = "450px";
    widgetStyle.position = "fixed";
    widgetStyle.bottom = "65px";
    widgetStyle.right = "35px";

    const svgData = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-square"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
    floatBtn.innerHTML = svgData;

    const iframe = document.createElement("iframe");

    const base = document.createElement("base");
    base.target = "_blank";
    iframe.append(base);

    const iframeStyle = iframe.style;
    iframeStyle.boxSizing = "borderBox";
    iframeStyle.position = "absolute";
    iframeStyle.right = 0;
    iframeStyle.top = 0;
    iframeStyle.width = "100%";
    iframeStyle.height = "100%";
    iframeStyle.border = 0;
    iframeStyle.borderRadius = "0.5rem";
    iframeStyle.margin = 0;
    iframeStyle.padding = 0;
    iframeStyle.width = "350px";

    widget.appendChild(iframe);
    document.body.appendChild(floatBtn);

    floatBtn.addEventListener("click", function () {
      if (widgetStyle.display == "none") {
        widgetStyle.display = "block";
      } else {
        widgetStyle.display = "none";
      }
    });

    const greeting = script.getAttribute("data-greeting");

    iframe.addEventListener("load", () => {});

    const license = script.getAttribute("data-license");
    const widgetUrl = `https://chatbot-widget-tawny.vercel.app/chat`;

    iframe.src = widgetUrl;

    document.body.appendChild(widget);
  };

  if (document.readyState === "complete") {
    loadWidget();
  } else {
    document.addEventListener("readystatechange", () => {
      if (document.readyState === "complete") {
        loadWidget();
      }
    });
  }
})();
