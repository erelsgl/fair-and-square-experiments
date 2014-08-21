set xrange [0:1]
set yrange [-1:3]
set xlabel 'noise proportion'
set ylabel 'gain/loss'
set key left top

f1(x)=a1*x+b1
f2(x)=a2*x+b2
f3(x)=a3*x+b3
f4(x)=a4*x+b4
f5(x)=a5*x+b5
f6(x)=a6*x+b6
zero(x)=0
fit f1(x) filename using 2:3 via a1,b1
fit f2(x) filename using 2:4 via a2,b2
fit f3(x) filename using 2:5 via a3,b3
fit f4(x) filename using 2:6 via a4,b4
fit f5(x) filename using 2:7 via a5,b5
fit f6(x) filename using 2:8 via a6,b6
plot \
	filename using 2:3 linetype rgb "blue" title 'egalitarian (alg)' with points, \
	f1(x) linetype rgb "blue" title '', \
	filename using 2:4 linetype rgb "green" title 'utilitarian (alg)' with points, \
	f2(x) linetype rgb "green" title '', \
	filename using 2:5 linetype rgb "red" title 'envy (alg)' with points, \
	f3(x) linetype rgb "red" title '', \
	filename using 2:6 linetype rgb "blue" title 'egalitarian (obj)' with points, \
	f4(x) linetype rgb "blue" title '', \
	filename using 2:7 linetype rgb "green" title 'utilitarian (obj)' with points, \
	f5(x) linetype rgb "green" title '', \
	filename using 2:8 linetype rgb "red" title 'envy (obj)' with points, \
	f6(x) linetype rgb "red" title '', \
	0 linetype rgb "black" title ''

 