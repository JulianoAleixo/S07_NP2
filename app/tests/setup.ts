import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// O jsdom não implementa estas APIs de navegador, usadas pelo framer-motion e pelo Navbar.
class IntersectionObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
        return [];
    }
}

class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
}

vi.stubGlobal("IntersectionObserver", IntersectionObserverStub);
vi.stubGlobal("ResizeObserver", ResizeObserverStub);
Element.prototype.scrollIntoView = () => {};

afterEach(() => {
    cleanup();
});
