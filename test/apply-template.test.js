import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { applyTemplate } from "../scripts/build.js";

describe("applyTemplate", () => {
  it("replaces every occurrence of a placeholder", () => {
    const html = applyTemplate("{{title}} — {{title}}", { title: "Hi" });
    assert.equal(html, "Hi — Hi");
  });

  it("treats missing values as empty", () => {
    const html = applyTemplate("{{title}}", { title: null });
    assert.equal(html, "");
  });

  it("does not interpret $ sequences in values as replacement patterns", () => {
    const html = applyTemplate("<div>{{content}}</div>", {
      content: "echo $'hello' $& $$x$$ $` $1 ${x}",
    });
    assert.equal(html, "<div>echo $'hello' $& $$x$$ $` $1 ${x}</div>");
  });

  it("does not splice neighboring template HTML into content that contains $'", () => {
    const html = applyTemplate("<main>{{content}}</main><footer>FOOTER</footer>", {
      content: "echo $'hello'",
    });
    assert.equal(html, "<main>echo $'hello'</main><footer>FOOTER</footer>");
  });
});
