import Image from "next/image";
import banner from "@/public/bg.gif";
import CourseList from "@/app/_components/CourseList";
const page = () => {
  return (
    <div>
      <div className="relative flex justify-center rounded-md border-4 border-gray-800 overflow-hidden mt-3 w-[80%] mx-auto box-shadow-lg h-[300px] sm:h-[400px]">
        <Image
          src={banner}
          alt="banner"
          priority
          className="border-4 border-gray-800 w-full h-full object-cover"
        />
        <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center bg-black/40 pointer-events-none">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-game font-bold text-white drop-shadow-lg">
            Explore Our Courses
          </h1>
          <p className="text-sm sm:text-base md:text-lg font-game text-white drop-shadow-lg mt-2 px-4 text-center">
            Dive into a variety of courses designed to enhance your skills and
            knowledge.
          </p>
        </div>
      </div>
      <div>
        <CourseList />
      </div>
    </div>
  );
};

export default page;
