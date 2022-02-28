/*global global*/
import { jest } from "@jest/globals";

import { PresignedUrlService } from "../assets/js/presigned-url-service";

describe("Test PresignedUrlService", () => {
  describe("Test fetchURL", () => {
    it("injects CSRF token in request header", () => {
      const presignedUrlService = new PresignedUrlService();
      document.cookie = "csrftoken=TOKEN";
      global.fetch = jest.fn();
      presignedUrlService.fetchURL("https://test.test");
      expect(global.fetch).toHaveBeenCalledWith("https://test.test", {
        method: "POST",
        headers: new Headers({
          "X-CSRFToken": "TOKEN",
        }),
      });
    });
  });
});
