cmake_minimum_required(VERSION 2.8)
project( gige )


if(UNIX)
    SET(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS}")
    #-Wall -Wc++11-extensions")
endif()

find_package( OpenCV REQUIRED )
find_package (Threads)

add_executable( main main.cpp )
target_link_libraries( main ${OpenCV_LIBS} )
target_link_libraries( main ${CMAKE_THREAD_LIBS_INIT})

add_executable( camerasim camerasim.cpp )
target_link_libraries( camerasim ${OpenCV_LIBS} )
target_link_libraries( camerasim ${CMAKE_THREAD_LIBS_INIT})

add_executable( gige gige.cpp )
target_link_libraries( gige ${OpenCV_LIBS} )
target_link_libraries( gige ${CMAKE_THREAD_LIBS_INIT})

#add_executable( ocr ocr.cpp )
#target_link_libraries( ocr ${OpenCV_LIBS} )
#target_link_libraries( ocr ${CMAKE_THREAD_LIBS_INIT})
