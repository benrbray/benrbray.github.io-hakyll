---
title:  Real-time Game Physics
date: March 20, 2020
tags:  geometry, game-dev, linear-algebra
tools: typescript
thumb_url: images/thumbnails/piano-cables-thumb.png
banner_url: images/thumbnails/piano-cables.jpg
banner_comment: Strings inside a Straube Playtona Player Piano (ca 1916)
unpublished: True
summary: Real-time Game Physics
---

# Articles

Collision Detection

* Part 1:  Convex Geometry
* [Part 2:  Minkowski Sum](/posts/2018/collision-detection-minkowski-sum)
* [Part 3:  Separating Axis Theorem](/posts/2017/collision-detection-separating-axis-theorem)
* [Part 4:  Gilbert-Johnson-Keerthi Algorithm](/posts/2020/collision-detection-gjk-epa)
* Part 5:  Expanding Polytope Algorithm

Real-time Game Physics

* Part 6: Physics Engine Pipeline
* Part 7: Time Steps & Numerical Integration
* Part 8: Impulse-based Physics & Sequential Impulse
* Part 9: Constraint-based Physics
* Part 10: Considerations for Real-time Physics
* Part 11: Continuous Collision Detection

Practical Game Physics

* Part 12: Bounding Volume Hierarchies

# References

* Math StackExchange, [Minkowski Sum and Vectors](https://math.stackexchange.com/questions/1709498/minkowski-sum-and-vectors?rq=1)

Convex Geometry

* StackExchange, [How to Determine Whether 2D Point is within Polygon](https://stackoverflow.com/questions/217578/how-can-i-determine-whether-a-2d-point-is-within-a-polygon?page=1&tab=active#tab-top)
* CGAL, ["Minkowski Sums"](https://doc.cgal.org/latest/Minkowski_sum_2/)
* Math StackExchange, [Proof: Minkowski sum polytope implies A and B polytopes](https://math.stackexchange.com/questions/985448/proof-minkowski-sum-polytope-implies-a-and-b-polytopes)

Collisions

* Stanford, [Collision Detection Links](http://graphics.stanford.edu/~jgao/collision-detection.html)
* StackExchange, [How to interpolate multiple high speed polygon collisions (2D)?](https://stackoverflow.com/questions/28265431/how-to-interpolate-multiple-high-speed-polygon-collisions-2d)
* Hamelot, [Material Point Method](https://hamelot.io/dynamics/material-point-method-mpm-reference/)
* Allen Chou, [Collision Detection - CSO & Support Function](http://allenchou.net/2013/12/game-physics-collision-detection-csos-support-functions/)
* Neumayr & Otter, ["Collision Handling with Variable-Step Integrators"](https://modiasim.github.io/Modia3D.jl/resources/documentation/CollisionHandling_Neumayr_Otter_2017.pdf)
* GameDev.net, ["Penetration Depth and Direction"](https://www.gamedev.net/forums/topic/607711-penetration-depth-and-direction/)
* MyPhysicsLab, [Multiple Simultaneous Collisions](https://www.myphysicslab.com/engine2D/collision-methods-en.html)

Misc

* Hamelot, [Rigid Body Dynamics](https://hamelot.io/dynamics/rigid-body-dynamics-part-1/)
* Pokutta, [Approximate Caratheodory via Frank-Wolfe](http://www.pokutta.com/blog/research/2019/11/30/approxCara-abstract.html)
* Macklin et al. 2019, [Non-smooth Newton Methods for Deformable Multi-body Dynamics](https://arxiv.org/pdf/1907.04587.pdf)
* Glatki, [A Zonotope Library for Hybrid Systems Reachability Analysis](https://www-i2.informatik.rwth-aachen.de/i2/fileadmin/user_upload/documents/HybridSystemsGroup/Bachelor_Master_theses/glatki_master.pdf)

Separating Axis Theorem

* Dyn4J, [Separating Axis Theorem](http://www.dyn4j.org/2010/01/sat/)
* Math StackExchange, [Proof of Separating Axis Theorem for Polygons](https://math.stackexchange.com/questions/2106402/proof-of-separating-axis-theorem-for-polygons)

Continuous Collision Detection

* Van den Bergen 2004, [Ray Casting against General Convex Objects with Application to Continuous Collision Detection](http://www.dtecta.com/papers/unpublished04raycast.pdf)
* WildBunny, [Collision Detection for Dummies](https://wildbunny.co.uk/blog/2011/04/20/collision-detection-for-dummies/)
* GameDev StackExchange, [Hexagon Collision for Fast-Moving Objects?](https://gamedev.stackexchange.com/questions/55873/hexagon-collision-detection-for-fast-moving-objects)

Gilbert-Johnson-Keerthi (GJK) Algorithm

* Casey Muratori 2006, [Implementing GJK](https://caseymuratori.com/blog_0003)
* Oxford, [Computing Distance Between Objects](http://www.cs.ox.ac.uk/people/stephen.cameron/distances/)
* Montanari 2016, [Improving the GJK algorithm for faster and more reliable
distance queries between convex objects](https://ora.ox.ac.uk/objects/uuid:69c743d9-73de-4aff-8e6f-b4dd7c010907/download_file?safe_filename=GJK.PDF&file_format=application%2Fpdf&type_of_work=Journal+article)
* LGGMonclar, [Visualizing GJK in 3D](https://lggmonclar.github.io/2019/03/06/visualizing_gjk.html)
* Lindemann, [GJK Distance Algorithm](https://www.medien.ifi.lmu.de/lehre/ss10/ps/Ausarbeitung_Beispiel.pdf)
* Dyn4J, [GJK Distance and Closest Points](http://www.dyn4j.org/2010/04/gjk-distance-closest-points/) and [GJK](http://www.dyn4j.org/2010/04/gjk-gilbert-johnson-keerthi/)
* Linahan, [Geometric Interpretation of GJK](https://arxiv.org/ftp/arxiv/papers/1505/1505.07873.pdf)
* Kroitor, [GJK.c](https://github.com/kroitor/gjk.c)
* Allen Chou, [Game Physics : GJK](http://allenchou.net/2013/12/game-physics-collision-detection-gjk/)

Expanding Polytope Algorithm

* Dyn4J, [Expanding Polytope Algorithm](http://www.dyn4j.org/2010/05/epa-expanding-polytope-algorithm/)
* YouTube, [EPA Visualization](https://www.youtube.com/watch?v=6rgiPrzqt9w)
* GameDev.net, [EPA (Expanding Polytope Algorithm)](https://www.gamedev.net/forums/topic/649946-epa-expanding-polytope-algorithm/)
* Van den Bergen, [Proximity Queries and Penetration Depth
Computation on 3D Game Objects](http://graphics.stanford.edu/courses/cs468-01-fall/Papers/van-den-bergen.pdf)

Minkowski Portal Refinement

* StackExchange, [MPR Collision Detection Algorithm](https://gamedev.stackexchange.com/questions/84562/minkowski-portal-refinement-collision-detection-algorithm)
* Newth 2013, [MPR and Speculative Contacts in Box2D](https://scholarworks.sjsu.edu/etd_projects/311/)
* BulletPhysics, [Minkowski Portal Refinement and FEM](https://github.com/bulletphysics/bullet3/pull/280)
* PyBullet, [Minkowski Portal Refinement and 2D](https://pybullet.org/Bullet/phpBB3/viewtopic.php?t=1964)
* PyBullet Forum, [Re: Minkowski Portal Refinement (MPR) for 2D](https://pybullet.org/Bullet/phpBB3/viewtopic.php?t=1964&start=15)
* XenoCollide, [Minkowski Portal refinement](http://xenocollide.snethen.com/mpr2d.html)
* XenoCollide, [Homepage](http://xenocollide.snethen.com/)
* Chris Pollett, [Minkowski Portal Refinement](http://www.cs.sjsu.edu/faculty/pollett/masters/Semesters/Spring12/josh/?mpr_report.html)