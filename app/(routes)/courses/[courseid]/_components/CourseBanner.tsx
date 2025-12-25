import Image from "next/image";
import { LoadingScreen } from "@/components/ui";
import { Button } from "@/components/ui/button";

interface Course {
  id: number;
  courseId: string;
  title: string;
  description: string;
  bannerImage: string;
  level: string;
  tags: string;
}

type Props = {
  loading?: boolean;
  courseDetail: Course | undefined;
};

const CourseBanner = ({ loading, courseDetail }: Props) => {
  return (
    <div className="flex justify-center items-center my-2">
      {loading ? (
        <LoadingScreen message="Loading course banner..." size="lg" />
      ) : (
        <div className="w-[80%] h-64 relative rounded-md overflow-hidden shadow-lg">
          <Image
            src={courseDetail?.bannerImage || "/default-banner.jpg"}
            alt={courseDetail?.title || "Course Banner"}
            layout="fill"
            objectFit="cover"
          />
          <div className="absolute inset-0  bg-opacity-50 flex flex-col justify-center items-start text-center p-4">
            <h1 className="text-4xl font-bold text-white mb-2 font-game">
              {courseDetail?.title}
            </h1>
            <p className="text-lg text-gray-200 font-comfortaa text-start">
              {courseDetail?.description}
            </p>
            <Button
              variant="pixel"
              className="mt-4 rounded-md text-black font-game"
            >
              Enroll Now
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseBanner;
