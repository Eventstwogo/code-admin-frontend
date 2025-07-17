import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const CategoryFormSkeleton = () => {
  return (
    <div className="min-h-screen bg-background transition-colors duration-200">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <Skeleton className="h-10 w-20 bg-muted animate-pulse" />
          <div className="flex gap-3">
            <Skeleton className="h-10 w-32 bg-muted animate-pulse" />
            <Skeleton className="h-10 w-20 bg-muted animate-pulse" />
          </div>
        </div>

        {/* Form Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Image Upload Card Skeleton */}
          <Card className="h-fit border-border/50 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-4">
              <CardTitle>
                <Skeleton className="h-6 w-32 bg-muted animate-pulse" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-border rounded-lg p-8 bg-muted/20">
                <div className="flex flex-col items-center space-y-4">
                  <Skeleton className="h-20 w-20 rounded-full bg-muted animate-pulse" />
                  <Skeleton className="h-4 w-48 bg-muted animate-pulse" />
                  <Skeleton className="h-10 w-28 bg-muted animate-pulse rounded-md" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Details Card Skeleton */}
          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-4">
              <CardTitle>
                <Skeleton className="h-6 w-36 bg-muted animate-pulse" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32 bg-muted animate-pulse" />
                <Skeleton className="h-10 w-full bg-muted animate-pulse rounded-md" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16 bg-muted animate-pulse" />
                <Skeleton className="h-10 w-full bg-muted animate-pulse rounded-md" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 bg-muted animate-pulse" />
                <Skeleton className="h-24 w-full bg-muted animate-pulse rounded-md" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32 bg-muted animate-pulse" />
                <Skeleton className="h-10 w-full bg-muted animate-pulse rounded-md" />
              </div>
            </CardContent>
          </Card>

          {/* Features Card Skeleton */}
          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-4">
              <CardTitle>
                <Skeleton className="h-6 w-20 bg-muted animate-pulse" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-3">
                  <Skeleton className="h-4 w-4 bg-muted animate-pulse rounded-sm" />
                  <Skeleton className="h-4 w-24 bg-muted animate-pulse" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* SEO Card Skeleton */}
          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-4">
              <CardTitle>
                <Skeleton className="h-6 w-36 bg-muted animate-pulse" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20 bg-muted animate-pulse" />
                <Skeleton className="h-10 w-full bg-muted animate-pulse rounded-md" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32 bg-muted animate-pulse" />
                <Skeleton className="h-20 w-full bg-muted animate-pulse rounded-md" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};