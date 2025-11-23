import { SplineScene } from "@/components/ui/spline";
import { Card } from "@/components/ui/card"
import { Spotlight } from "@/components/ui/spotlight"
 
export function SplineSceneBasic() {
  return (
    <Card className="w-full h-[500px] md:h-[600px] bg-gradient-to-br from-blue-50 to-sky-100 relative overflow-hidden border-blue-200 shadow-lg">
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="rgba(59, 130, 246, 0.3)"
      />
      
      <div className="flex flex-col md:flex-row h-full">
        {/* Left content */}
        <div className="flex-1 p-6 md:p-8 relative z-10 flex flex-col justify-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-blue-600 via-blue-500 to-sky-500">
            Immersive Creator Experience
          </h1>
          <p className="mt-4 text-blue-700 max-w-lg text-sm md:text-base">
            Experience the future of creator-fan relationships through interactive 3D visualizations. 
            Explore token metrics, track performance, and engage with creators in entirely new ways.
          </p>
        </div>

        {/* Right content */}
        <div className="flex-1 relative min-h-[300px] md:min-h-0">
          <SplineScene 
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
          />
        </div>
      </div>
    </Card>
  )
}

