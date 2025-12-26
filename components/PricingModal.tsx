"use client";

import { PricingTable } from "@clerk/nextjs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PricingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PricingModal({ open, onOpenChange }: PricingModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-y-auto border-4 border-black rounded-none shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] bg-white dark:bg-gray-900"
        style={{
          imageRendering: "pixelated",
        }}
      >
        <DialogHeader>
          <DialogTitle className="font-game font-normal text-3xl border-b-4 border-black pb-4 mb-4">
            🚀 Upgrade to Premium
          </DialogTitle>
          <DialogDescription className="font-comfortaa text-lg">
            Unlock unlimited access to all courses and chapters
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <PricingTable />
        </div>
      </DialogContent>
    </Dialog>
  );
}
