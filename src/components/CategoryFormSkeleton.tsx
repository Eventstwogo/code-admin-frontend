import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const CategoryFormSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 transition-all duration-300">
      <div className="container mx-auto px-4 py-8 max-w-7xl animate-in fade-in-0 duration-700">
        {/* Header Skeleton */}
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 rounded-2xl -z-10" />
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 p-6 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl shadow-sm">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-20" />
              <div className="hidden sm:block w-px h-8 bg-border/60" />
              <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
            
            <div className="flex gap-3">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </div>

        {/* Form Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Upload Card Skeleton */}
          <Card className="h-fit border-border/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-sm">
            <CardHeader className="pb-6 bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg">
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <Skeleton className="h-6 w-32" />
              </div>
              <Skeleton className="h-4 w-48 mt-2" />
            </CardHeader>
            <CardContent className="p-6">
              <div className="border-2 border-dashed border-border/60 rounded-xl p-8 text-center">
                <Skeleton className="h-16 w-16 rounded-full mx-auto mb-6" />
                <Skeleton className="h-4 w-48 mx-auto mb-4" />
                <Skeleton className="h-10 w-32 mx-auto mb-2" />
                <Skeleton className="h-3 w-40 mx-auto" />
              </div>
            </CardContent>
          </Card>

          {/* Category Details Card Skeleton */}
          <Card className="border-border/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-sm">
            <CardHeader className="pb-6 bg-gradient-to-r from-accent/5 to-primary/5 rounded-t-lg">
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <Skeleton className="h-6 w-36" />
              </div>
              <Skeleton className="h-4 w-52 mt-2" />
            </CardHeader>
            <CardContent className="space-y-8 p-6">
              {/* Category Name Field */}
              <div className="space-y-3">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-12 w-full" />
              </div>

              {/* Slug Field */}
              <div className="space-y-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-12 w-full" />
              </div>

              {/* Description Field */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-24 w-full" />
              </div>

              {/* Parent Category Field */}
              <div className="space-y-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-12 w-full" />
              </div>
            </CardContent>
          </Card>

          {/* Features Card Skeleton */}
          <Card className="border-border/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-sm">
            <CardHeader className="pb-6 bg-gradient-to-r from-green-500/5 to-blue-500/5 rounded-t-lg">
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-4 w-44 mt-2" />
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center justify-between p-5 rounded-xl border border-border/40">
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-6 w-11 rounded-full ml-6" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* SEO Fields Card Skeleton */}
          <Card className="border-border/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-sm">
            <CardHeader className="pb-6 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-t-lg">
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <Skeleton className="h-6 w-36" />
              </div>
              <Skeleton className="h-4 w-56 mt-2" />
            </CardHeader>
            <CardContent className="space-y-8 p-6">
              {/* Meta Title Field */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-3 w-64" />
              </div>

              {/* Meta Description Field */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-3 w-72" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};