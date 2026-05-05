/**
 * XML + XSLT layer for itineraries.
 * - serializeItinerary: build a well-formed XML document from app data.
 * - parseItineraryXml:  parse user-imported XML into a typed object.
 * - renderItineraryHtml: apply the bundled XSLT stylesheet to produce styled HTML.
 */

export interface XmlActivity {
  title: string;
  location?: string;
  day_number: number;
  position: number;
  start_time?: string;
  notes?: string;
}

export interface XmlItinerary {
  title: string;
  destination: string;
  start_date?: string;
  end_date?: string;
  notes?: string;
  tags: string[];
  cover_emoji?: string;
  activities: XmlActivity[];
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function serializeItinerary(it: XmlItinerary): string {
  const tags = it.tags.map((t) => `    <tag>${esc(t)}</tag>`).join("\n");
  const acts = it.activities
    .map(
      (a) => `    <activity day="${a.day_number}" position="${a.position}">
      <title>${esc(a.title)}</title>
      ${a.location ? `<location>${esc(a.location)}</location>` : ""}
      ${a.start_time ? `<startTime>${esc(a.start_time)}</startTime>` : ""}
      ${a.notes ? `<notes>${esc(a.notes)}</notes>` : ""}
    </activity>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/itinerary.xsl"?>
<itinerary>
  <meta>
    <title>${esc(it.title)}</title>
    <destination>${esc(it.destination)}</destination>
    ${it.start_date ? `<startDate>${it.start_date}</startDate>` : ""}
    ${it.end_date ? `<endDate>${it.end_date}</endDate>` : ""}
    ${it.cover_emoji ? `<coverEmoji>${esc(it.cover_emoji)}</coverEmoji>` : ""}
    ${it.notes ? `<notes>${esc(it.notes)}</notes>` : ""}
    <tags>
${tags}
    </tags>
  </meta>
  <activities>
${acts}
  </activities>
</itinerary>`;
}

export function parseItineraryXml(xml: string): XmlItinerary {
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  const err = doc.querySelector("parsererror");
  if (err) throw new Error("Invalid XML: " + err.textContent);

  const text = (sel: string, root: ParentNode = doc) =>
    root.querySelector(sel)?.textContent?.trim() ?? undefined;

  const tags = Array.from(doc.querySelectorAll("meta > tags > tag"))
    .map((n) => n.textContent?.trim() ?? "")
    .filter(Boolean);

  const activities: XmlActivity[] = Array.from(doc.querySelectorAll("activities > activity")).map((a) => ({
    day_number: Number(a.getAttribute("day") ?? "1"),
    position: Number(a.getAttribute("position") ?? "0"),
    title: text("title", a) ?? "Untitled",
    location: text("location", a),
    start_time: text("startTime", a),
    notes: text("notes", a),
  }));

  return {
    title: text("meta > title") ?? "Untitled trip",
    destination: text("meta > destination") ?? "Unknown",
    start_date: text("meta > startDate"),
    end_date: text("meta > endDate"),
    cover_emoji: text("meta > coverEmoji"),
    notes: text("meta > notes"),
    tags,
    activities,
  };
}

const XSLT = `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" indent="yes"/>
  <xsl:template match="/itinerary">
    <div class="xslt-itinerary">
      <header class="xslt-header">
        <div class="xslt-emoji"><xsl:value-of select="meta/coverEmoji"/></div>
        <h1><xsl:value-of select="meta/title"/></h1>
        <p class="xslt-dest"><xsl:value-of select="meta/destination"/></p>
        <p class="xslt-dates">
          <xsl:value-of select="meta/startDate"/> &#8594; <xsl:value-of select="meta/endDate"/>
        </p>
        <div class="xslt-tags">
          <xsl:for-each select="meta/tags/tag">
            <span class="xslt-tag"><xsl:value-of select="."/></span>
          </xsl:for-each>
        </div>
      </header>
      <section class="xslt-days">
        <xsl:for-each select="activities/activity">
          <xsl:sort select="@day" data-type="number"/>
          <xsl:sort select="@position" data-type="number"/>
          <article class="xslt-activity">
            <div class="xslt-day">Day <xsl:value-of select="@day"/></div>
            <div class="xslt-body">
              <h3><xsl:value-of select="title"/></h3>
              <xsl:if test="location"><p class="xslt-loc">📍 <xsl:value-of select="location"/></p></xsl:if>
              <xsl:if test="startTime"><p class="xslt-time">🕒 <xsl:value-of select="startTime"/></p></xsl:if>
              <xsl:if test="notes"><p class="xslt-notes"><xsl:value-of select="notes"/></p></xsl:if>
            </div>
          </article>
        </xsl:for-each>
      </section>
    </div>
  </xsl:template>
</xsl:stylesheet>`;

export function renderItineraryHtml(it: XmlItinerary): string {
  const xml = serializeItinerary(it);
  const xmlDoc = new DOMParser().parseFromString(xml, "application/xml");
  const xslDoc = new DOMParser().parseFromString(XSLT, "application/xml");
  const proc = new XSLTProcessor();
  proc.importStylesheet(xslDoc);
  const fragment = proc.transformToFragment(xmlDoc, document);
  const wrapper = document.createElement("div");
  wrapper.appendChild(fragment);
  return wrapper.innerHTML;
}

export function downloadXml(it: XmlItinerary) {
  const blob = new Blob([serializeItinerary(it)], { type: "application/xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${it.title.replace(/\s+/g, "-").toLowerCase()}.xml`;
  a.click();
  URL.revokeObjectURL(url);
}
