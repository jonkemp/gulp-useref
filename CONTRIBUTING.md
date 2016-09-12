# Contributing to gulp-useref

First, thanks for your initiative to help out! One of the reasons that open
source is so great is because of the eagerness of others to help.

Please take a moment to review this document in order to make the contribution
process easy and effective for everyone involved.

Following these guidelines helps to communicate that you respect the time of
the developers managing and developing this open source project. In return,
they should reciprocate that respect in addressing your issue or assessing
patches and features.


## Asking a Question

Before you ask, do some searching and reading. Check the docs, Google, GitHub,
and StackOverflow. If your question is something that has been answered many
times before, the project maintainers might be tired of repeating themselves.

Whenever possible, ask your question on a public forum. This allows anyone to
answer and makes the answer available for the next person with the same question.
If all else fails, you might tweet at or email the maintainer(s).


## Using the issue tracker

The issue tracker is the preferred channel for [bug reports](#bug-reports),
[features requests](#feature-requests) and [submitting pull
requests](#pull-requests), but please respect the following restrictions:

* Please **do not** use the issue tracker for personal support requests (use
  [Stack Overflow](http://stackoverflow.com) or IRC).

* Please **do not** derail or troll issues. Keep the discussion on topic and
  respect the opinions of others.


## Bug reports

A bug is a _demonstrable problem_ that is caused by the code in the repository.
Good bug reports are extremely helpful - thank you!

### Has This Been Asked Before?

Before you submit a bug report, you should search existing issues. Be sure to
check both currently open issues, as well as issues that are already closed. If
you find an issue that seems to be similar to yours, read through it.

If this issue is the same as yours, you can comment with additional information
to help the maintainer debug it. Adding a comment will subscribe you to email
notifications, which can be helpful in getting important updates regarding the
issue. If you don't have anything to add but still want to receive email
updates, you can click the "watch" button at the bottom of the comments.

### Nope, Hasn't Been Asked Before

If you can't find anything in the existing issues, don't be shy about filing a
new one.

You should be sure to include the version the project, as well as versions of
related software. For example, be sure to include the version numbers output by
the commands `node --version` and `npm list`. If you notice that your installed
version is not the latest, use `npm update` and confirm that the issue is still
there.

Please be as thorough as possible. It helps us address the problem more quickly,
so everyone wins!

Guidelines for bug reports:

1. **Use the GitHub issue search** &mdash; check if the issue has already been
   reported.

2. **Check if the issue has been fixed** &mdash; try to reproduce it using the
   latest `master` or development branch in the repository.

3. **Isolate the problem** &mdash; create a [reduced test
   case](https://css-tricks.com/reduced-test-cases/) and a live example.

A good bug report shouldn't leave others needing to chase you up for more
information. Please try to be as detailed as possible in your report. What is
your environment? What steps will reproduce the issue? What browser(s) and OS
experience the problem? What would you expect to be the outcome? All these
details will help people to fix any potential bugs.

Example:

> Short and descriptive example bug report title
>
> A summary of the issue and the browser/OS environment in which it occurs. If
> suitable, include the steps required to reproduce the bug.
>
> 1. This is the first step
> 2. This is the second step
> 3. Further steps, etc.
>
> `<url>` - a link to the reduced test case
>
> Any other information you want to share that is relevant to the issue being
> reported. This might include the lines of code that you have identified as
> causing the bug, and potential solutions (and your opinions on their
> merits).


## Feature requests

Feature requests are welcome. But take a moment to find out whether your idea
fits with the scope and aims of the project. It's up to *you* to make a strong
case to convince the project's developers of the merits of this feature. Please
provide as much detail and context as possible.


## Pull requests

Good pull requests - patches, improvements, new features - are a fantastic
help. They should remain focused in scope and avoid containing unrelated
commits.

**Please ask first** before embarking on any significant pull request (e.g.
implementing features, refactoring code, porting to a different language),
otherwise you risk spending a lot of time working on something that the
project's developers might not want to merge into the project.

Before you set out to improve the code, you should have a focused idea in mind
of what you want to do.

Each commit should do one thing, and each PR should be one specific improvement.

Please adhere to the coding conventions used throughout a project (indentation,
accurate comments, etc.) and any other requirements (such as test coverage).

Follow this process if you'd like your work considered for inclusion in the
project:

1. [Fork](http://help.github.com/fork-a-repo/) the project, clone your fork,
   and configure the remotes:

   ```bash
   # Clone your fork of the repo into the current directory
   $ git clone https://github.com/<your-username>/gulp-useref
   # Navigate to the newly cloned directory
   $ cd gulp-useref
   # Assign the original repo to a remote called "upstream"
   $ git remote add upstream https://github.com/jonkemp/gulp-useref
   ```

2. If you cloned a while ago, get the latest changes from upstream:

   ```bash
   $ git checkout <dev-branch>
   $ git pull upstream <dev-branch>
   ```

3. Create a new topic branch (off the main project development branch) to
   contain your feature, change, or fix:

   ```bash
   $ git checkout -b <topic-branch-name>
   ```

4. Add relevant tests to cover the change.

5. Make sure test-suite passes: `npm test`

6. Commit your changes in logical chunks. Please adhere to these [git commit
   message guidelines](http://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html)
   or your code is unlikely be merged into the main project. Use Git's
   [interactive rebase](https://help.github.com/articles/interactive-rebase)
   feature to tidy up your commits before making them public.

7. Locally merge (or rebase) the upstream development branch into your topic branch:

   ```bash
   $ git pull [--rebase] upstream <dev-branch>
   ```

8. Push your topic branch up to your fork:

   ```bash
   $ git push origin <topic-branch-name>
   ```

9. [Open a Pull Request](https://help.github.com/articles/using-pull-requests/)
    with a clear title and description.

## Conventions of commit messages

Addding files on repo

```bash
$ git commit -m "Add filename"
```

Updating files on repo

```bash
$ git commit -m "Update filename, filename2, filename3"
```

Removing files on repo

```bash
$ git commit -m "Remove filename"
```

Renaming files on repo

```bash
$ git commit -m "Rename filename"
```

Fixing errors and issues on repo

```bash
$ git commit -m "Fixed #issuenumber Message about this fix"
```

Adding features on repo

```bash
$ git commit -m "Add Feature: nameoffeature Message about this feature"
```

Updating features on repo

```bash
$ git commit -m "Update Feature: nameoffeature Message about this update"
```

Removing features on repo

```bash
$ git commit -m "Remove Feature: nameoffeature Message about this"
```

Ignoring Travis CI build on repo

```bash
$ git commit -m "Commit message here [ci-skip]"
```

**IMPORTANT**: By submitting a patch, you agree to allow the project owner to
license your work under the same license as that used by the project.


## Etiquette

### Assume Everyone is Doing Their Best

Project maintainers are busy, so give them some time. Developers involved in
open source often contribute to many projects. It's not uncommon for a developer
to receive dozens of issues notifications a day, so be patient. Maybe the
maintainer has other important things in their life that they need to address.
Prioritizing those things over something on GitHub doesn't make someone lazy.
The health, happiness, and wellbeing of the real person on the other end of the
internet is much more important than any bug.

One of the strengths of open source is that you can always fork and fix problems
yourself.


## Conclusion

Thanks for taking the time to read this! Contributions are welcome. Hopefully,
this guide will help make good contributions easier and ultimately, everyone
benefits.
