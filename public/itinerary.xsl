<?xml version="1.0" encoding="UTF-8"?>
<!--
  Standalone XSLT stylesheet for an exported itinerary XML file.
  When the user opens an exported .xml directly in a browser, this stylesheet
  renders it as a styled HTML page (referenced via <?xml-stylesheet?>).
-->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" indent="yes"/>
  <xsl:template match="/itinerary">
    <html>
      <head>
        <title><xsl:value-of select="meta/title"/></title>
        <style>
          body { font-family: -apple-system, system-ui, sans-serif; background:#f8f6f1; color:#1a2733; max-width: 760px; margin: 0 auto; padding: 48px 24px; }
          header { text-align:center; margin-bottom: 48px; }
          .emoji { font-size: 64px; }
          h1 { font-size: 36px; margin: 8px 0; }
          .dest { color:#3a6f8a; font-size:18px; margin:0; }
          .dates { color:#6b7d8a; margin:8px 0 16px; }
          .tag { display:inline-block; background:#e6eef3; padding:4px 12px; border-radius:999px; margin:0 4px; font-size:13px; }
          article { display:flex; gap:24px; padding:20px; background:#fff; border-radius:12px; margin-bottom:14px; box-shadow: 0 2px 12px rgba(0,0,0,.04); }
          .day { font-weight:600; color:#1a6f9a; min-width:70px; }
          h3 { margin:0 0 6px; font-size:18px; }
          p { margin: 4px 0; color:#4a5a66; font-size:14px; }
        </style>
      </head>
      <body>
        <header>
          <div class="emoji"><xsl:value-of select="meta/coverEmoji"/></div>
          <h1><xsl:value-of select="meta/title"/></h1>
          <p class="dest"><xsl:value-of select="meta/destination"/></p>
          <p class="dates"><xsl:value-of select="meta/startDate"/> → <xsl:value-of select="meta/endDate"/></p>
          <div>
            <xsl:for-each select="meta/tags/tag">
              <span class="tag"><xsl:value-of select="."/></span>
            </xsl:for-each>
          </div>
        </header>
        <section>
          <xsl:for-each select="activities/activity">
            <xsl:sort select="@day" data-type="number"/>
            <xsl:sort select="@position" data-type="number"/>
            <article>
              <div class="day">Day <xsl:value-of select="@day"/></div>
              <div>
                <h3><xsl:value-of select="title"/></h3>
                <xsl:if test="location"><p>📍 <xsl:value-of select="location"/></p></xsl:if>
                <xsl:if test="startTime"><p>🕒 <xsl:value-of select="startTime"/></p></xsl:if>
                <xsl:if test="notes"><p><xsl:value-of select="notes"/></p></xsl:if>
              </div>
            </article>
          </xsl:for-each>
        </section>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
