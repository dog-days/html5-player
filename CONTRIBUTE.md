# 贡献

感谢各位大大考虑一起为`Html Player`做出贡献！ 贡献无论大小， 请花时间阅读本文件，然后再作出贡献，以确保每个参与者都拥有一个有趣而有效的过程。

## 提交Issue

如果使用中发现问题，并且查看支持API后还是无法解决您的问题，请提交issue让我们知道。本项目的贡献者和维护者，将尽最大努力尽快帮助您。或者有新的想法也可以提交issue。

提交issue之前，建议按照以下检查清单过一遍：

- 检查控制台
  - 有没有网络错误（404,403,500等）？
  - 是否存在CORS错误（跨域问题）？
- 检查你的播放器
  - 您当前使用的是最新版本吗？如果不是建议使用最新版本。
  - 你的配置是否生效了？
- 检查你的浏览器
  - 您是否使用受支持的浏览器？
  - 你使用的是最新版本吗？如果不是建议使用最新版本的浏览器尝试下。
  - 浏览器是否支持您尝试使用的功能？
  - 我们是否实现了您使用的功能？
- 检查您的代码
  - 您是否使用支持的媒体类型？
  - 你正确使用API吗？
- 如果都没解决您的问题，请查看已有的issue中是否有一样的问题。

### Issue提交格式

我们希望您按照一定的格式提交issue，统一的issue，可以让我们帮助我们更快速的找出问题所在。

不同的种类的issue的格式也是不一样的。

#### bug issue格式

```markdown
### 预期行为（Expected Behavior）
描述内容
### 实际行为（Actual Behavior）
错误信息等
### 重现步骤（Steps to reproduce）
详细步骤，如果能给出在线demo，那更好。
### 环境（Environment）
- 系统(版本)
- 浏览器(版本)
- html5 player(版本)
### 补充说明（Additional Notes）
详细信息
```

范例：

```markdown
### 预期行为
点击播放器静音按钮，应该静音，并且图标需要切换正确。
### 实际行为
静音效果正常，但是图标没有切换成静音图标。
### 重现步骤
请看[demo](https://dog-days.github.io/demo/html5-player/)
### 环境
- macOS(High Sierra 10.13.3)
	- Google Chrome(64.0.3282.186)
	- html5 player(0.2.2)
- windows(10)
	- Google Chrome(64.0.3282.186)
	- html5 player(0.2.2)
```

#### 功能建议issue格式

这种格式随意，没什么限制，能让人看懂就好。

## Pull Requests

如果你觉得可以解决发现的问题或者开发新功能，您可以一起参与代码编写。当然在之前，您最好先提交一个issue询问我们是否需要修复或者新增新的功能，我们也不希望浪费你的时间和精力。

###仓库管理规范

为了更好的协同维护仓库代码，仓库维护者需要遵循下面的协作规范，fork仓库后开发者也建议这样管理。

我们为git定下一种分支模型，在这种模型中，分支有两类，五种

- 永久性分支
  - `master branch`：主分支
  - `develop branch`：开发分支
- 临时性分支
  - `feature branch`：功能分支
  - `release branch`：预发布分支
  - `bugfix branch`：bug修复分支

#### 永久性分支

永久性分支是寿命无限的分支，存在于整个项目的开始、开发、迭代、终止过程中。永久性分支只有两个`master`和`develop`。

**master**：主分支从项目一开始便存在，它用于存放经过测试，已经完全稳定代码；在项目开发以后的任何时刻当中，`master`存放的代码应该是可作为当前最新可以用版本代码。所以，我们随时保持`master`仓库代码的清洁和稳定，确保入库之前是通过完全测试和代码reivew的。`master`分支是所有分支中最不活跃的，大概每个月或每两个月更新一次，每一次`master`更新的时候我们都会打上`tag`，并发布了一个新的可用版本。

**develop**：开发分支，一开始从master分支中分离出来，用于开发者存放基本稳定代码。fork仓库的每个开发者的仓库相当于源仓库的一个镜像，每个开发者自己的仓库上也有`master`和`develop`。开发者把功能做好以后，是存放到自己的`develop`中，当测试完以后，可以向我们发起一个`pull request`，请求把自己仓库的`develop`分支合并到源仓库的`develop`中。

所有开发者开发好的功能会在源仓库的`develop`分支中进行汇总，当`develop`中的代码经过不断的测试，已经逐渐趋于稳定了。这时候，仓库维护者会把`develop`分支合并到`master`分支中，发布一个新版本。

> 注意，任何人不应该向`master`直接进行无意义的合并、提交操作。正常情况下，`master`只应该接受`develop`的合并，也就是说，`master`所有代码更新应该源于合并`develop`的代码。

#### 暂时性分支

暂时性分支和永久性分支不同，暂时性分支在开发过程中是一定会被删除的。所有暂时性分支，一般源于`develop`，最终也一定会回归合并到`develop`。

- **feature**

  功能性分支，是用于开发项目的功能的分支，是开发者主要战斗阵地。开发者在本地仓库从`develop`分支分出功能分支，在该分支上进行功能的开发，开发完成以后再合并到`develop`分支上，这时候功能性分支已经完成任务，可以删除（当然我们会先保留一段时间）。功能性分支的命名一般为`feature-*`，*为需要开发的功能的名称。

  举一个例子，假设你想参与进来，而且已经把源仓库fork了，并且clone到了本地。现在您有个新的test功能，您在本地仓库中可以这样做：

  step 1: 切换到`develop`分支

  ```sh
  # git checkout -b develop
  # git push origin develop
  # 如果没有deveop分支使用上面的命令
  git checkout develop
  ```

  step 2: 分出一个功能性分支

  ```sh
  git checkout -b feature-test
  # git push origin feature-test
  # 如果你需要保留次分支，上面的代码提交到远程仓库
  ```

  step 3: 在功能性分支上进行开发工作，多次commit，测试以后...

  step 4: 把做好的功能合并到`develop`中

  ```sh
  # 回到develop分支
  git checkout develop
  # 把做好的功能合并到develop中
  git rebase feature-test ##不要使用merge，merge导致分支线交叉，看起来乱。
  # git push origin feature-test
  # 如果你需要保留次分支，上面的代码提交到线上
  # 删除本地功能性分支，不一定要急着删除，可以保留一段时间。
  # git branch -d feature-test
  # 删除远程功能性分支，不一定要急着删除，可以保留一段时间。
  # git push origin feature-test --delete
  # 把develop提交到自己的远程仓库中
  git push origin develop
  ```

  这样，就完成一次功能的开发和提交。

- **bugfix**

  步骤跟feature的一样的。修复bug分支，版本已发布，突然出现了的bug。这时候就要新建一个`bugfix`分支，继续紧急的bug修复工作，当bug修复完以后，把该分支合并到`develop`和`master`以后，就可以把该分支删除。修复bug分支命名一般为`bugfix-*`。

- **hotfix**

  发布后发现重大bug，需要立即修复并重新发布版本。

#### 小结

如果您新增一个功能或者修复了一个bug后，**确定代码测试通过，可以向我们发起一个`pull request`，请求把自己仓库的`develop`分支合并到源仓库的`develop`中。**































