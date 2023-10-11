import { Component, InfernoEventHandler, linkEvent } from "inferno";
import { Helmet } from "inferno-helmet";
import { i18n, LANGUAGES } from "../i18next";
import { T } from "inferno-i18next";
import { instance_stats } from "../instance_stats";
import { getQueryParams, mdToHtml, numToSI } from "../utils";
import { Badge, SELECT_CLASSES, TEXT_GRADIENT } from "./common";
import {
  INSTANCE_HELPERS,
  Topic,
  RECOMMENDED_INSTANCES,
  All_TOPIC,
  TOPICS,
} from "./instances-definitions";
import { Icon } from "./icon";
import { I18nKeys } from "i18next";

const TitleBlock = () => (
  <div className="flex flex-col items-center pt-16 mb-16">
    <T i18nKey="lemmy_servers" className="text-4xl font-bold mb-3">
      #<span className={TEXT_GRADIENT}>#</span>
    </T>
    <p className="text-xl text-gray-300 text-center max-w-xl">
      {i18n.t("instance_totals", {
        instances: numToSI(instance_stats.stats.crawled_instances),
        users: numToSI(instance_stats.stats.users_active_month),
      })}
    </p>
  </div>
);

const ComparisonBlock = () => (
  <div>
    <div className="text-md text-gray-300 mb-3">
      {i18n.t("instance_comparison")}:
    </div>
    <div className="card card-bordered bg-neutral-900 shadow-xl">
      <div className="card-body p-4">
        <div className="flex flex-row flex-wrap gap-4 mb-2">
          {INSTANCE_HELPERS.map(i => (
            <Badge
              content={
                <a href={i.link}>
                  <Icon
                    icon="embed"
                    classes={`fill-current text-primary mr-2`}
                  />
                  <span className="text-gray-300">{i.name}</span>
                </a>
              }
            />
          ))}
        </div>
      </div>
    </div>
  </div>
);

const SectionTitle = ({ title }) => (
  <div className="text-2xl mb-3">{title}</div>
);

interface InstanceCardGridProps {
  title: string;
  instances: any[];
}

const InstanceCardGrid = ({ instances }: InstanceCardGridProps) => (
  <div className="grid md:grid-cols-3 grid-cols-1 gap-4">
    {instances.map(i => (
      <InstanceCard instance={i} />
    ))}
  </div>
);

interface InstanceCardProps {
  instance: any;
}

function buildUrl(domain: string): string {
  return `https://${domain}`;
}

const InstanceCard = ({ instance }: InstanceCardProps) => {
  const domain = instance.domain;
  const description = instance.site_info.site_view.site.description;
  const sidebar = instance.site_info.site_view.site.sidebar || description;
  const icon =
    instance.site_info.site_view.site.icon || "/static/assets/images/lemmy.svg";
  const banner = instance.site_info.site_view.site.banner;
  const users = instance.site_info.site_view.counts.users;
  const comments = instance.site_info.site_view.counts.comments;
  const monthlyUsers = instance.site_info.site_view.counts.users_active_month;

  const modalId = `modal_${domain}`;

  return (
    <div className="card card-bordered bg-neutral-900 shadow-xl">
      <div className="card-body p-4">
        <div className="flex flex-row flex-wrap gap-4">
          <DetailsModal
            id={modalId}
            domain={domain}
            banner={banner}
            users={users}
            comments={comments}
            monthlyUsers={monthlyUsers}
            icon={icon}
            sidebar={sidebar}
          />
          <InstanceIcon icon={icon} />
          <InstanceStats
            users={users}
            comments={comments}
            monthlyUsers={monthlyUsers}
          />
        </div>
        <div className={`text-2xl font-bold ${TEXT_GRADIENT}`}>{domain}</div>
        <p className="text-sm text-gray-300 mb-2">{description}</p>
        <div class="flex flex-row flex-wrap justify-between gap-2">
          <a
            class="btn btn-primary text-white sm:max-md:btn-block bg-gradient-to-r from-[#69D066] to-[#03A80E] normal-case"
            href={buildUrl(domain)}
          >
            {i18n.t("join_a_server")}
          </a>
          <button
            class="btn btn-secondary btn-outline text-white sm:max-md:btn-block normal-case"
            onClick={() =>
              (document.getElementById(modalId) as any).showModal()
            }
          >
            {i18n.t("more_information")}
          </button>
        </div>
      </div>
    </div>
  );
};

const imgError =
  "this.onError=null;this.src='/static/assets/images/lemmy.svg';" as unknown as InfernoEventHandler<HTMLImageElement>;

const InstanceIcon = ({ icon }) => (
  <div className="rounded-xl bg-neutral-800 p-4">
    <img className="w-24 h-24" src={icon} onError={imgError} />
  </div>
);

const InstanceStats = ({ users, comments, monthlyUsers }) => (
  <div className="flex flex-col flex-wrap justify-between">
    <StatsBadges
      users={users}
      comments={comments}
      monthlyUsers={monthlyUsers}
    />
  </div>
);

export const StatsBadges = ({ users, comments, monthlyUsers }) => (
  <>
    <Badge
      content={
        <div className="text-sm text-gray-500">
          <Icon icon="users" classes="mr-2" />
          <span>{users.toLocaleString()}</span>
        </div>
      }
    />
    <Badge
      content={
        <div className="text-sm text-gray-500">
          <Icon icon="message-circle" classes="mr-2" />
          <span>{comments.toLocaleString()}</span>
        </div>
      }
    />
    <Badge
      content={
        <div className="text-sm text-gray-500">
          <Icon icon="user-check" classes="mr-2" />
          <span>
            {i18n.t("per_month", {
              formattedCount: monthlyUsers.toLocaleString(),
            })}
          </span>
        </div>
      }
    />
  </>
);

export const DetailsModal = ({
  id,
  domain,
  icon,
  banner,
  users,
  comments,
  monthlyUsers,
  sidebar,
}) => (
  <dialog id={id} className="modal">
    <form method="dialog" className="modal-backdrop">
      <button>close</button>
    </form>
    <div className="modal-box w-10/12 max-w-5xl bg-neutral-900">
      <form method="dialog">
        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
          ✕
        </button>
      </form>
      {banner && (
        <img
          src={banner}
          className="object-cover w-full h-48 rounded-xl mb-3"
        />
      )}
      <div className="flex flex-row flex-wrap gap-4 mb-3 items-center">
        {icon && <img className="w-8 h-8" src={icon} onError={imgError} />}
        <StatsBadges
          users={users}
          comments={comments}
          monthlyUsers={monthlyUsers}
        />
        <div className="btn btn-primary btn-outline btn-sm normal-case">
          <a href={buildUrl(domain)}>{i18n.t("join")}</a>
        </div>
      </div>
      {sidebar && (
        <article className="prose max-w-none prose-a:text-primary prose-h1:text-primary">
          <div dangerouslySetInnerHTML={mdToHtml(sidebar)} />
        </article>
      )}
      <a
        className="btn btn-primary btn-block text-white normal-case"
        href={buildUrl(domain)}
      >
        {i18n.t("join")}
      </a>
    </div>
  </dialog>
);

interface Sort {
  name: string;
  icon: string;
}

const RANDOM_SORT: Sort = {
  name: "random",
  icon: "TBD",
};

const MOST_ACTIVE_SORT: Sort = {
  name: "most_active",
  icon: "TBD",
};

const LEAST_ACTIVE_SORT: Sort = {
  name: "least_active",
  icon: "TBD",
};

const SORTS: Sort[] = [RANDOM_SORT, MOST_ACTIVE_SORT, LEAST_ACTIVE_SORT];

function sortRandom(instances: any[]): any[] {
  return instances
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

function sortActive(instances: any[]): any[] {
  return instances.sort(
    (a, b) =>
      b.site_info.site_view.counts.users_active_month -
      a.site_info.site_view.counts.users_active_month,
  );
}

interface State {
  instances: any[];
  sort: Sort;
  language: string;
  topic: Topic;
  scroll: boolean;
}

interface Props {
  sort: Sort;
  language: string;
  topic: Topic;
  scroll: boolean;
}

function getSortFromQuery(sort?: string): Sort {
  return SORTS.find(s => s.name == sort) ?? RANDOM_SORT;
}

function getTopicFromQuery(topic?: string): Topic {
  return TOPICS.find(c => c.name == topic) ?? All_TOPIC;
}

function getInstancesQueryParams() {
  return getQueryParams<Props>({
    sort: getSortFromQuery,
    language: d => d || "all",
    topic: getTopicFromQuery,
    scroll: d => !!d,
  });
}

export class Instances extends Component<Props, State> {
  state: State = {
    instances: [],
    sort: RANDOM_SORT,
    language: "all",
    topic: All_TOPIC,
    scroll: false,
  };

  constructor(props: any, context: any) {
    super(props, context);
  }

  // Set the filters by the query params if they exist
  componentDidMount(): void {
    this.setState(getInstancesQueryParams());
    this.buildInstanceList();
    this.scrollToSearch();
  }

  scrollToSearch() {
    if (this.state.scroll) {
      const el = document.getElementById("search")?.offsetTop;
      if (el) {
        window.scrollTo({ top: el, behavior: "smooth" });
      }
    }
  }

  buildInstanceList() {
    let instances = instance_stats.stats.instance_details;
    const recommended = RECOMMENDED_INSTANCES;

    // Language Filter
    if (this.state.language !== "all") {
      const languageRecs = recommended.filter(r =>
        r.languages.includes(this.state.language),
      );
      instances = instances.filter(i =>
        languageRecs.map(r => r.domain).includes(i.domain),
      );
    }

    // Topic filter
    if (this.state.topic !== All_TOPIC) {
      const topicRecs = recommended.filter(r =>
        r.topics.includes(this.state.topic),
      );
      instances = instances.filter(i =>
        topicRecs.map(c => c.domain).includes(i.domain),
      );
    }

    // Sort
    if (this.state.sort == RANDOM_SORT) {
      instances = sortRandom(instances);
    } else if (this.state.sort == MOST_ACTIVE_SORT) {
      instances = sortActive(instances);
    } else {
      instances = sortActive(instances).reverse();
    }

    this.setState({ instances });
  }

  render() {
    const title = i18n.t("join_title");

    return (
      <div className="container mx-auto">
        <Helmet title={title}>
          <meta property={"title"} content={title} />
        </Helmet>
        <TitleBlock />
        <ComparisonBlock />
        {this.filterAndTitleBlock()}
        <div className="mt-4">
          {this.state.instances.length > 0 ? (
            <InstanceCardGrid
              title={i18n.t("popular_instances")}
              instances={this.state.instances}
            />
          ) : (
            this.seeAllBtn()
          )}
        </div>
      </div>
    );
  }

  seeAllBtn() {
    return (
      <div>
        <p className="text-sm text-gray-300 mb-4">{i18n.t("none_found")}</p>
        <button
          className="btn btn-sm btn-secondary text-white normal-case"
          onClick={linkEvent(this, handleSeeAll)}
        >
          {i18n.t("see_all_servers")}
        </button>
      </div>
    );
  }

  filterAndTitleBlock() {
    return (
      <div id="search" className="mt-16">
        <div className="flex flex-row flex-wrap gap-4">
          <div className="flex-none">
            <SectionTitle title={i18n.t("join_title")} />
          </div>
          <div className="grow"></div>
          <div className="flex-none">
            <select
              className={`${SELECT_CLASSES} mr-2`}
              value={this.state.topic.name}
              onChange={linkEvent(this, handleTopicChange)}
              name="topic_select"
            >
              <option disabled selected>
                {i18n.t("topic")}
              </option>
              {TOPICS.map(c => (
                <option key={c.name} value={c.name}>
                  {i18n.t(c.name as I18nKeys)}
                </option>
              ))}
            </select>
            <select
              value={this.state.language}
              onChange={linkEvent(this, handleLanguageChange)}
              className={`${SELECT_CLASSES} mr-2`}
            >
              <option disabled>Languages</option>
              <option key="all" value="all">
                {i18n.t("all_languages")}
              </option>
              {LANGUAGES.map((l, i) => (
                <option key={i} value={l.code}>
                  {l.name}
                </option>
              ))}
            </select>
            <select
              value={this.state.sort.name}
              name="sort_select"
              className={SELECT_CLASSES}
              onChange={linkEvent(this, handleSortChange)}
            >
              <option disabled>{i18n.t("sort")}</option>
              {SORTS.map(s => (
                <option key={s.name} value={s.name}>
                  {i18n.t(s.name as I18nKeys)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    );
  }
}

function handleSortChange(i: Instances, event: any) {
  i.setState({
    sort: SORTS.find(s => s.name == event.target.value) ?? RANDOM_SORT,
  });
  i.buildInstanceList();
}

function handleTopicChange(i: Instances, event: any) {
  i.setState({
    topic: TOPICS.find(c => c.name == event.target.value) ?? All_TOPIC,
  });
  i.buildInstanceList();
}

function handleLanguageChange(i: Instances, event: any) {
  i.setState({ language: event.target.value });
  i.buildInstanceList();
}

function handleSeeAll(i: Instances) {
  i.setState({
    sort: RANDOM_SORT,
    language: "all",
    topic: All_TOPIC,
  });
  i.buildInstanceList();
}
