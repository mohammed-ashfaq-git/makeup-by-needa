"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  type CartItem,
  buildCartWhatsAppLink,
  loadCartFromStorage,
  saveCartToStorage,
} from "@/lib/cart";

type ServiceCartContextType = {
  items: CartItem[];
  addItem: (item: {
    id?: string;
    name: string;
    category: string;
    subcategory?: string | null;
    price?: string | null;
    quantity?: number;
  }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  eventDate: string;
  setEventDate: (date: string) => void;
  notes: string;
  setNotes: (notes: string) => void;
  isOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  totalCount: number;
  businessName: string;
  whatsappNumber: string;
};

const ServiceCartContext = createContext<ServiceCartContextType | null>(null);

export function useServiceCart(): ServiceCartContextType {
  const ctx = useContext(ServiceCartContext);
  if (!ctx) {
    throw new Error(
      "useServiceCart must be used within a ServiceCartProvider",
    );
  }
  return ctx;
}

export function ServiceCartProvider({
  businessName,
  whatsappNumber,
  children,
}: {
  businessName: string;
  whatsappNumber: string;
  children: React.ReactNode;
}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [eventDate, setEventDate] = useState("");
  const [notes, setNotes] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage on client mount
  useEffect(() => {
    setItems(loadCartFromStorage());
    setHydrated(true);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (hydrated) {
      saveCartToStorage(items);
    }
  }, [items, hydrated]);

  const addItem = useCallback(
    (item: {
      id?: string;
      name: string;
      category: string;
      subcategory?: string | null;
      price?: string | null;
      quantity?: number;
    }) => {
      const itemId =
        item.id ||
        `${item.category}:${item.subcategory || ""}:${item.name}`.toLowerCase();
      const qtyToAdd = item.quantity || 1;

      setItems((prev) => {
        const existingIndex = prev.findIndex((i) => i.id === itemId);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + qtyToAdd,
          };
          return updated;
        }
        return [
          ...prev,
          {
            id: itemId,
            name: item.name,
            category: item.category,
            subcategory: item.subcategory ?? null,
            price: item.price ?? null,
            quantity: qtyToAdd,
          },
        ];
      });
    },
    [],
  );

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.id !== id));
    } else {
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, quantity } : i)),
      );
    }
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const openDrawer = useCallback(() => setIsOpen(true), []);
  const closeDrawer = useCallback(() => setIsOpen(false), []);
  const toggleDrawer = useCallback(() => setIsOpen((prev) => !prev), []);

  const totalCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      eventDate,
      setEventDate,
      notes,
      setNotes,
      isOpen,
      openDrawer,
      closeDrawer,
      toggleDrawer,
      totalCount,
      businessName,
      whatsappNumber,
    }),
    [
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      eventDate,
      notes,
      isOpen,
      openDrawer,
      closeDrawer,
      toggleDrawer,
      totalCount,
      businessName,
      whatsappNumber,
    ],
  );

  return (
    <ServiceCartContext.Provider value={value}>
      {children}
      <ServiceCartFloatingButton />
      <ServiceCartDrawer />
    </ServiceCartContext.Provider>
  );
}

/** Floating bottom-left button matching the site styling */
function ServiceCartFloatingButton() {
  const { totalCount, toggleDrawer } = useServiceCart();

  return (
    <button
      type="button"
      className="service-cart-fab"
      onClick={toggleDrawer}
      aria-label={`My Services Enquiry Cart (${totalCount} item${
        totalCount === 1 ? "" : "s"
      })`}
      title="My Selected Services"
    >
      <span className="cart-fab-icon" aria-hidden="true">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
          <path d="M3 6h18" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      </span>
      <span className="cart-fab-label">My services</span>
      {totalCount > 0 && <span className="cart-fab-badge">{totalCount}</span>}
    </button>
  );
}

/** Slide-over drawer for services enquiry */
function ServiceCartDrawer() {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    eventDate,
    setEventDate,
    notes,
    setNotes,
    isOpen,
    closeDrawer,
    totalCount,
    businessName,
    whatsappNumber,
  } = useServiceCart();

  // Close on Escape key
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        closeDrawer();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, closeDrawer]);

  if (!isOpen) return null;

  const whatsappUrl = buildCartWhatsAppLink({
    whatsappNumber,
    businessName,
    items,
    eventDate,
    notes,
  });

  return (
    <div className="service-cart-backdrop" onClick={closeDrawer}>
      <aside
        className="service-cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="My selected services enquiry"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cart-drawer-header">
          <div>
            <h3>My Services</h3>
            <p className="cart-drawer-sub">
              {totalCount === 0
                ? "No services selected yet"
                : `${totalCount} item${
                    totalCount === 1 ? "" : "s"
                  } ready for enquiry`}
            </p>
          </div>
          <button
            type="button"
            className="cart-drawer-close"
            onClick={closeDrawer}
            aria-label="Close drawer"
          >
            ✕
          </button>
        </div>

        <div className="cart-drawer-body">
          {items.length === 0 ? (
            <div className="cart-empty-state">
              <span className="cart-empty-icon" aria-hidden="true">
                ✨
              </span>
              <h4>Your enquiry list is empty</h4>
              <p>
                Browse the hairstyling, makeup and nail artistry menus and click
                “Add to enquiry” to build your custom appointment package.
              </p>
              <button
                type="button"
                className="button small"
                onClick={closeDrawer}
              >
                Browse services
              </button>
            </div>
          ) : (
            <>
              <div className="cart-items-list">
                {items.map((item) => (
                  <div className="cart-item-row" key={item.id}>
                    <div className="cart-item-info">
                      <div className="cart-item-cat-badge">
                        <span>{item.category}</span>
                        {item.subcategory && (
                          <span className="cart-subcat">
                            · {item.subcategory}
                          </span>
                        )}
                      </div>
                      <h4 className="cart-item-name">{item.name}</h4>
                      <div className="cart-item-price">
                        {item.price || "Enquire for pricing"}
                      </div>
                    </div>

                    <div className="cart-item-actions">
                      <div className="cart-qty-control">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        className="cart-item-delete"
                        onClick={() => removeItem(item.id)}
                        aria-label={`Remove ${item.name}`}
                        title="Remove service"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="cart-enquiry-form">
                <div className="cart-field">
                  <label htmlFor="cart-event-date">
                    Event / preferred date (optional)
                  </label>
                  <input
                    id="cart-event-date"
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                  />
                </div>

                <div className="cart-field">
                  <label htmlFor="cart-notes">Notes or requests (optional)</label>
                  <textarea
                    id="cart-notes"
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Bridal party of 4, ceremony at 2 PM…"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-drawer-footer">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="cart-whatsapp-btn"
            >
              <span aria-hidden="true">💬</span> Send on WhatsApp
            </a>
            <button
              type="button"
              className="cart-clear-btn"
              onClick={clearCart}
            >
              Clear list
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}

/**
 * Reusable Add to Enquiry button for service rows and cards.
 */
export function AddToEnquiryButton({
  service,
  className = "",
  variant = "pill",
  children,
}: {
  service: {
    id?: number | string;
    name: string;
    category: string;
    subcategory?: string | null;
    price?: string | null;
  };
  className?: string;
  variant?: "pill" | "button" | "small";
  children?: React.ReactNode;
}) {
  const { addItem, items } = useServiceCart();
  const [justAdded, setJustAdded] = useState(false);

  const itemId =
    service.id != null
      ? String(service.id)
      : `${service.category}:${service.subcategory || ""}:${service.name}`.toLowerCase();

  const isAlreadyInCart = items.some((i) => i.id === itemId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItem({
      id: itemId,
      name: service.name,
      category: service.category,
      subcategory: service.subcategory,
      price: service.price,
    });

    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
    }, 1500);
  };

  const baseClass =
    variant === "button"
      ? "button small add-to-enquiry-btn"
      : variant === "small"
      ? "add-to-enquiry-link"
      : "add-to-enquiry-pill";

  return (
    <button
      type="button"
      className={`${baseClass} ${justAdded ? "is-added" : ""} ${className}`}
      onClick={handleClick}
      aria-label={`Add ${service.name} to WhatsApp enquiry`}
    >
      {justAdded ? (
        <span>Added ✓</span>
      ) : children ? (
        children
      ) : (
        <span>{isAlreadyInCart ? "+ Add more" : "+ Add to enquiry"}</span>
      )}
    </button>
  );
}
