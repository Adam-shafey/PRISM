import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Lightbulb, Map } from "lucide-react";
import { PRODUCTS, PRODUCT_CONFIG } from "@shared/products";

interface ProductSwitcherProps {
  userPermissions: {
    discoveryPermissions: string[];
    planningPermissions: string[];
  };
}

export function ProductSwitcher({ userPermissions }: ProductSwitcherProps) {
  const [location, setLocation] = useLocation();
  
  // Determine current product based on path
  const currentProduct = location.startsWith('/planning') ? PRODUCTS.PLANNING : PRODUCTS.DISCOVERY;
  const currentConfig = PRODUCT_CONFIG[currentProduct];
  
  // Check if user has access to each product
  const hasDiscoveryAccess = userPermissions.discoveryPermissions.length > 0;
  const hasPlanningAccess = userPermissions.planningPermissions.length > 0;
  
  // If user only has access to one product, don't show dropdown
  if (!hasDiscoveryAccess && !hasPlanningAccess) {
    return (
      <div className="flex items-center gap-2 px-6 py-4 border-b">
        <Lightbulb className="h-6 w-6 text-primary" />
        <div className="flex flex-col">
          <span className="text-lg font-semibold">PRISM</span>
          <span className="text-xs text-muted-foreground">Product Discovery</span>
        </div>
      </div>
    );
  }
  
  if ((hasDiscoveryAccess && !hasPlanningAccess) || (!hasDiscoveryAccess && hasPlanningAccess)) {
    return (
      <div className="flex items-center gap-2 px-6 py-4 border-b">
        {currentProduct === PRODUCTS.DISCOVERY ? (
          <Lightbulb className="h-6 w-6 text-primary" />
        ) : (
          <Map className="h-6 w-6 text-primary" />
        )}
        <div className="flex flex-col">
          <span className="text-lg font-semibold">PRISM</span>
          <span className="text-xs text-muted-foreground">{currentConfig.shortName}</span>
        </div>
      </div>
    );
  }

  const handleProductSwitch = (product: string) => {
    if (product === PRODUCTS.DISCOVERY) {
      setLocation('/');
    } else if (product === PRODUCTS.PLANNING) {
      setLocation('/planning');
    }
  };

  return (
    <div className="px-6 py-4 border-b">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-0 h-auto font-normal">
            <div className="flex items-center gap-2">
              {currentProduct === PRODUCTS.DISCOVERY ? (
                <Lightbulb className="h-6 w-6 text-primary" />
              ) : (
                <Map className="h-6 w-6 text-primary" />
              )}
              <div className="flex flex-col items-start">
                <span className="text-lg font-semibold">PRISM</span>
                <span className="text-xs text-muted-foreground">{currentConfig.shortName}</span>
              </div>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-80">
          {hasDiscoveryAccess && (
            <DropdownMenuItem 
              onClick={() => handleProductSwitch(PRODUCTS.DISCOVERY)}
              className="flex items-center gap-3 p-3"
            >
              <Lightbulb className="h-5 w-5 text-primary" />
              <div className="flex flex-col">
                <span className="font-medium">{PRODUCT_CONFIG[PRODUCTS.DISCOVERY].name}</span>
                <span className="text-sm text-muted-foreground">
                  {PRODUCT_CONFIG[PRODUCTS.DISCOVERY].description}
                </span>
              </div>
            </DropdownMenuItem>
          )}
          {hasPlanningAccess && (
            <DropdownMenuItem 
              onClick={() => handleProductSwitch(PRODUCTS.PLANNING)}
              className="flex items-center gap-3 p-3"
            >
              <Map className="h-5 w-5 text-primary" />
              <div className="flex flex-col">
                <span className="font-medium">{PRODUCT_CONFIG[PRODUCTS.PLANNING].name}</span>
                <span className="text-sm text-muted-foreground">
                  {PRODUCT_CONFIG[PRODUCTS.PLANNING].description}
                </span>
              </div>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}